import { NextResponse } from 'next/server'
import { getDiscordActivity } from '@/lib/discord'
import { getCurrentTrack } from '@/lib/spotify'

export async function GET() {
  try {
    
    const [discordActivity, spotifyTrack] = await Promise.all([
      getDiscordActivity(),
      getCurrentTrack()
    ])

    const activity = discordActivity ? {
      type: discordActivity.type === 0 ? 'coding' : 
            discordActivity.type === 2 ? 'gaming' : 'other',
      details: discordActivity.details || '',
      application: discordActivity.name,
      timestamp: Date.now()
    } : null

    return NextResponse.json({
      success: true,
      activity,
      currentTrack: spotifyTrack,
      discordActivity,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Status endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch status',
      lastUpdated: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {

  return NextResponse.json({ message: 'Status update endpoint' })
}