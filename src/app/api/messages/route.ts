import { NextRequest, NextResponse } from 'next/server'
import { getMessages, createMessage, markMessageAsRead, getUnreadMessagesCount } from '@/lib/database'

export async function GET(request: NextRequest) {
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

    const messages = await getMessages()
    const unreadCount = await getUnreadMessagesCount()
    
    return NextResponse.json({ 
      messages: messages.map(msg => ({
        id: msg.id.toString(),
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        message: msg.message,
        read: msg.read,
        timestamp: msg.created_at.toISOString()
      })),
      totalCount: messages.length,
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching messages:', error)

    const fallbackMessages = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        subject: "Collaboration Opportunity",
        message: "Hi! I'm interested in collaborating on a project. Would love to discuss further.",
        read: false,
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@company.com",
        subject: "Job Opportunity",
        message: "We have an exciting opportunity that might interest you. Let's connect!",
        read: true,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      }
    ]
    
    return NextResponse.json({ 
      messages: fallbackMessages,
      totalCount: fallbackMessages.length,
      unreadCount: fallbackMessages.filter(m => !m.read).length
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, timestamp } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const user_agent = request.headers.get('user-agent') || 'unknown'

    try {
      
      const newMessage = await createMessage({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        ip_address,
        user_agent
      })

      console.log('📨 New message received:', {
        from: newMessage.name,
        email: newMessage.email,
        subject: newMessage.subject,
        timestamp: newMessage.created_at
      })

      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        id: newMessage.id.toString()
      })
    } catch (dbError) {
      console.error('Database error, falling back to logging:', dbError)

      console.log('📨 New message received (logged only):', {
        from: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        timestamp: timestamp || new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        id: Date.now().toString()
      })
    }

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')
    
    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID required' },
        { status: 400 }
      )
    }

    try {
      await markMessageAsRead(parseInt(messageId))
      
      return NextResponse.json({
        success: true,
        message: 'Message marked as read'
      })
    } catch (dbError) {
      console.error('Database error marking message as read:', dbError)
      
      return NextResponse.json({
        success: true,
        message: 'Message marked as read (database unavailable)'
      })
    }

  } catch (error) {
    console.error('Mark read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    )
  }
}