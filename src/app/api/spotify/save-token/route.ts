import { NextRequest, NextResponse } from 'next/server'
import { saveAuthToken } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { access_token, refresh_token, expires_in } = await request.json()

    if (!access_token || !refresh_token) {
      return NextResponse.json({ 
        error: 'Missing required tokens' 
      }, { status: 400 })
    }

    await saveAuthToken('spotify', {
      access_token,
      refresh_token,
      expires_in
    })

    return NextResponse.json({ 
      success: true,
      message: 'Spotify tokens saved successfully' 
    })

  } catch (error) {
    console.error('Error saving Spotify tokens:', error)
    return NextResponse.json({ 
      error: 'Failed to save tokens' 
    }, { status: 500 })
  }
} 