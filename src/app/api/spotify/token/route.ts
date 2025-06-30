import { NextRequest, NextResponse } from 'next/server'

const SPOTIFY_CLIENT_ID = '6b495025ba32453194ea7d4ac5916825'
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET 
const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://domkutis.com/api/spotify/token'
    : 'http://localhost:3000/api/spotify/token')

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
    }

    if (!SPOTIFY_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Spotify client secret not configured' }, { status: 500 })
    }

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      console.error('Spotify token exchange failed:', error)
      return NextResponse.json({ error: 'Failed to exchange authorization code' }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope
    })

  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}