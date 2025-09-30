import { NextRequest, NextResponse } from 'next/server'
import { getMessages, createMessage, markMessageAsRead, getUnreadMessagesCount, deleteMessage } from '@/lib/database'

async function verifyAuthorization(request: NextRequest): Promise<boolean> {
  const discordToken = request.headers.get('discord-token')
  const apiKey = request.headers.get('x-api-key')
  
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    return true
  }
  
  if (!discordToken) {
    return false
  }

  try {
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${discordToken}`
      }
    })

    if (!userResponse.ok) {
      return false
    }

    const userData = await userResponse.json()
    const authorizedUserId = process.env.NEXT_PUBLIC_DISCORD_USER_ID

    return userData.id === authorizedUserId
  } catch (error) {
    console.error('Discord verification failed:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const isAuthorized = await verifyAuthorization(request)
    
    if (!isAuthorized) {
      return NextResponse.json({ 
        error: 'Unauthorized access. Admin authentication required.' 
      }, { status: 401 })
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
        timestamp: msg.created_at,
        ip_address: msg.ip_address,
        user_agent: msg.user_agent
      })),
      totalCount: messages.length,
      unreadCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    
    return NextResponse.json({ 
      error: 'Database connection failed. Unable to retrieve messages.',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    let ip_address = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     request.headers.get('cf-connecting-ip') ||
                     request.headers.get('x-client-ip') ||
                     'unknown'

    if (ip_address && ip_address !== 'unknown') {
      ip_address = ip_address.split(',')[0].trim()

      if (ip_address === '::1' || ip_address === '127.0.0.1') {
        ip_address = 'localhost'
      }
    }

    const user_agent = request.headers.get('user-agent') || 'unknown'

    const newMessage = await createMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ip_address,
      user_agent
    })

    console.log('📨 New message received:', {
      id: newMessage.id,
      from: newMessage.name,
      email: newMessage.email,
      subject: newMessage.subject,
      timestamp: newMessage.created_at,
      ip: ip_address
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! I\'ll get back to you soon.',
      id: newMessage.id.toString()
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const isAuthorized = await verifyAuthorization(request)
    
    if (!isAuthorized) {
      return NextResponse.json({ 
        error: 'Unauthorized access. Admin authentication required.' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')
    
    if (!messageId || isNaN(parseInt(messageId))) {
      return NextResponse.json(
        { error: 'Valid message ID required' },
        { status: 400 }
      )
    }

    await markMessageAsRead(parseInt(messageId))
    
    console.log(`📖 Message ${messageId} marked as read`)
    
    return NextResponse.json({
      success: true,
      message: 'Message marked as read'
    })

  } catch (error) {
    console.error('Error marking message as read:', error)
    
    return NextResponse.json({ 
      error: 'Failed to mark message as read',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAuthorized = await verifyAuthorization(request)
    
    if (!isAuthorized) {
      return NextResponse.json({ 
        error: 'Unauthorized access. Admin authentication required.' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')
    
    if (!messageId || isNaN(parseInt(messageId))) {
      return NextResponse.json(
        { error: 'Valid message ID required' },
        { status: 400 }
      )
    }

    const deleted = await deleteMessage(parseInt(messageId))
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    console.log(`🗑️ Message ${messageId} deleted`)
    
    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting message:', error)
    
    return NextResponse.json({ 
      error: 'Failed to delete message',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}