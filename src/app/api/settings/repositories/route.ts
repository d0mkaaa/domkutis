import { NextRequest, NextResponse } from 'next/server'
import { getRepositorySettings, updateRepositorySettings } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const discordToken = request.headers.get('discord-token')
    
    if (!discordToken) {
      const settings = await getRepositorySettings('default')
      return NextResponse.json({
        success: true,
        data: settings || {
          hidden_repos: [],
          featured_repos: []
        }
      })
    }

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

    const settings = await getRepositorySettings('default')
    
    return NextResponse.json({
      success: true,
      data: settings || {
        hidden_repos: [],
        featured_repos: []
      }
    })
  } catch (error) {
    console.error('Error fetching repository settings:', error)

    return NextResponse.json({
      success: true,
      data: {
        hidden_repos: [],
        featured_repos: []
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
    const { hidden_repos, featured_repos } = body

    const updatedSettings = await updateRepositorySettings('default', {
      hidden_repos,
      featured_repos
    })

    return NextResponse.json({
      success: true,
      message: 'Repository settings updated successfully',
      data: updatedSettings
    })
  } catch (error) {
    console.error('Error updating repository settings:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update repository settings'
    }, { status: 500 })
  }
}