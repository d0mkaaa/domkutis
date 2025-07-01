import { NextResponse } from 'next/server'
import { getAuthToken } from '@/lib/database'

export async function GET() {
  try {
    const storedToken = await getAuthToken('spotify')
    
    if (!storedToken?.refresh_token) {
      return NextResponse.json({ 
        error: 'No refresh token found in database' 
      }, { status: 404 })
    }

    console.log('Testing refresh token...')
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: `grant_type=refresh_token&refresh_token=${storedToken.refresh_token}`
    });

    console.log('Spotify refresh response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Spotify refresh error:', errorText)
      return NextResponse.json({
        error: 'Refresh failed',
        status: response.status,
        details: errorText,
        tokenInfo: {
          hasRefreshToken: !!storedToken.refresh_token,
          refreshTokenLength: storedToken.refresh_token.length,
          updatedAt: storedToken.updated_at
        }
      }, { status: 400 })
    }

    const data = await response.json()
    console.log('Refresh successful, testing current track...')

    const trackResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`
      }
    });

    console.log('Current track response status:', trackResponse.status)

    let trackData = null
    if (trackResponse.status === 200) {
      trackData = await trackResponse.json()
    } else if (trackResponse.status === 204) {
      trackData = { message: 'Not currently playing' }
    }

    return NextResponse.json({
      success: true,
      message: 'Spotify refresh token works!',
      refreshResult: {
        status: response.status,
        newAccessTokenLength: data.access_token.length
      },
      currentTrack: trackData,
      tokenInfo: {
        updatedAt: storedToken.updated_at,
        expiresAt: storedToken.expires_at
      }
    })

  } catch (error) {
    console.error('Test Spotify error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 