import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, saveAuthToken } from '@/lib/database'

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
      throw new Error('Failed to refresh token');
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

export async function GET(request: NextRequest) {
  try {
    let accessToken: string;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    } else {
      
      try {
        accessToken = await getAccessToken();
      } catch (error) {
        return NextResponse.json({ 
          error: 'No valid access token available. Please connect Spotify in the dashboard.' 
        }, { status: 401 });
      }
    }

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204) {
      
      return NextResponse.json({ isPlaying: false });
    }

    if (response.status === 401) {
      
      return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });
    }

    if (!response.ok) {
      console.error('Spotify API error:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch current track' }, { status: response.status });
    }

    const data = await response.json();

    if (!data.item) {
      return NextResponse.json({ isPlaying: false });
    }

    const trackInfo = {
      name: data.item.name,
      artists: data.item.artists.map((artist: any) => ({
        name: artist.name,
        url: artist.external_urls.spotify
      })),
      album: {
        name: data.item.album.name,
        url: data.item.album.external_urls.spotify
      },
      images: {
        large: data.item.album.images[0]?.url || null,
        medium: data.item.album.images[1]?.url || null,
        small: data.item.album.images[2]?.url || null
      },
      isPlaying: data.is_playing,
      progress: data.progress_ms || 0,
      duration: data.item.duration_ms,
      external_url: data.item.external_urls.spotify,
      preview_url: data.item.preview_url,
      explicit: data.item.explicit,
      popularity: data.item.popularity,
      fetchedAt: Date.now() 
    };

    return NextResponse.json(trackInfo);

  } catch (error) {
    console.error('Current track API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}