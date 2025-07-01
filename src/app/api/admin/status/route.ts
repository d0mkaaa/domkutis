import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    let spotifyConnected = false
    let spotifyError = null
    
    try {
      const spotifyToken = await getAuthToken('spotify')
      spotifyConnected = !!spotifyToken?.refresh_token
    } catch (error) {
      spotifyError = error instanceof Error ? error.message : 'Unknown error'
    }

    let databaseWorking = false
    let databaseError = null
    
    try {
      await getAuthToken('test')
      databaseWorking = true
    } catch (error) {
      databaseError = error instanceof Error ? error.message : 'Unknown error'
      if (databaseError.includes('no token') || databaseError.includes('not found')) {
        databaseWorking = true
        databaseError = null
      }
    }

    return NextResponse.json({
      success: true,
      status: {
        spotify: {
          connected: spotifyConnected,
          error: spotifyError
        },
        database: {
          working: databaseWorking,
          error: databaseError
        }
      },
      message: spotifyConnected 
        ? 'All systems operational! Your Spotify activity is live on your public website.' 
        : 'Connect Spotify in your dashboard to show real-time music activity to visitors.'
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check system status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 