import { NextRequest, NextResponse } from 'next/server'
import { getActivitySettings, updateActivitySettings } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Allow public access to activity settings so the public website can respect them
    const settings = await getActivitySettings('default')
    
    return NextResponse.json({
      success: true,
      data: settings || {
        show_discord: true,
        show_spotify: true,
        show_coding: true,
        show_gaming: true,
        show_general: true
      }
    })
  } catch (error) {
    console.error('Error fetching activity settings:', error)
    
    // Return defaults if error
    return NextResponse.json({
      success: true,
      data: {
        show_discord: true,
        show_spotify: true,
        show_coding: true,
        show_gaming: true,
        show_general: true
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const discordToken = request.headers.get('discord-token')
    
    if (!discordToken) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    }

    // Verify admin access
    try {
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${discordToken}`
        }
      })

      if (!userResponse.ok) {
        return NextResponse.json({ error: 'Invalid Discord token' }, { status: 401 })
      }

      const userData = await userResponse.json()
      const authorizedUserId = process.env.NEXT_PUBLIC_DISCORD_USER_ID

      if (userData.id !== authorizedUserId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ error: 'Discord authentication failed' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      show_discord, 
      show_spotify, 
      show_coding, 
      show_gaming, 
      show_general 
    } = body

    const updatedSettings = await updateActivitySettings('default', {
      show_discord,
      show_spotify,
      show_coding,
      show_gaming,
      show_general
    })

    return NextResponse.json({
      success: true,
      message: 'Activity settings updated successfully',
      data: updatedSettings
    })
  } catch (error) {
    console.error('Error updating activity settings:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update activity settings'
    }, { status: 500 })
  }
} 