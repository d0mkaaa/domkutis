interface SpotifyTrack {
  name: string;
  artists: Array<{
    name: string;
    url: string;
  }>;
  album: {
    name: string;
    url: string;
  };
  images: {
    large: string | null;
    medium: string | null;
    small: string | null;
  };
  isPlaying: boolean;
  progress: number;
  duration: number;
  external_url: string;
  explicit: boolean;
  fetchedAt: number;
}

import { getAuthToken, saveAuthToken } from './database'

async function getAccessToken() {
  try {
    const storedToken = await getAuthToken('spotify')
    
    if (!storedToken?.refresh_token) {
      throw new Error('No refresh token available. Please connect Spotify in the dashboard.')
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: `grant_type=refresh_token&refresh_token=${storedToken.refresh_token}`
    });

    if (!response.ok) {
      throw new Error('Failed to refresh Spotify token');
    }

    const data = await response.json();
    
    await saveAuthToken('spotify', {
      access_token: data.access_token,
      refresh_token: storedToken.refresh_token,
      expires_in: data.expires_in
    })
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function getCurrentTrack(): Promise<SpotifyTrack | null> {
  try {
    const accessToken = await getAccessToken();
    
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204 || !response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.is_playing || !data.item) {
      return null;
    }

    const track = data.item;
    const images = track.album.images;

    return {
      name: track.name,
      artists: track.artists.map((artist: any) => ({
        name: artist.name,
        url: artist.external_urls.spotify
      })),
      album: {
        name: track.album.name,
        url: track.album.external_urls.spotify
      },
      images: {
        large: images.find((img: any) => img.height === 640)?.url || images[0]?.url || null,
        medium: images.find((img: any) => img.height === 300)?.url || images[1]?.url || null,
        small: images.find((img: any) => img.height === 64)?.url || images[2]?.url || null
      },
      isPlaying: data.is_playing,
      progress: data.progress_ms,
      duration: track.duration_ms,
      external_url: track.external_urls.spotify,
      explicit: track.explicit,
      fetchedAt: Date.now()
    };
  } catch (error) {
    console.error('Failed to fetch Spotify track:', error);
    return null;
  }
}