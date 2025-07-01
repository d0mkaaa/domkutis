import { NextResponse } from 'next/server'
import { getDatabase, getAuthToken } from '@/lib/database'

export async function GET() {
  try {
    const db = getDatabase()
    
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='auth_tokens'").get()
    
    const allTokens = db.prepare("SELECT id, user_id, service, LENGTH(access_token) as access_len, LENGTH(refresh_token) as refresh_len, expires_at, updated_at FROM auth_tokens").all()
    
    let spotifyTokenFromFunction = null
    try {
      spotifyTokenFromFunction = await getAuthToken('spotify')
    } catch (error) {
      spotifyTokenFromFunction = { error: error instanceof Error ? error.message : 'Unknown error' }
    }

    return NextResponse.json({
      success: true,
      debug: {
        tableExists: !!tableCheck,
        allTokensCount: allTokens.length,
        allTokens: allTokens,
        spotifyTokenFromFunction: spotifyTokenFromFunction ? {
          id: spotifyTokenFromFunction.id,
          service: spotifyTokenFromFunction.service,
          hasRefreshToken: !!spotifyTokenFromFunction.refresh_token,
          refreshTokenLength: spotifyTokenFromFunction.refresh_token?.length || 0,
          expiresAt: spotifyTokenFromFunction.expires_at,
          updatedAt: spotifyTokenFromFunction.updated_at
        } : null,
        databasePath: process.cwd() + '/data/messages.db'
      }
    })

  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 