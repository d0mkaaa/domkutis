import { NextResponse } from 'next/server'
import { deleteAuthToken } from '@/lib/database'

export async function POST() {
  try {
    await deleteAuthToken('spotify')

    return NextResponse.json({ 
      success: true,
      message: 'Spotify tokens removed successfully' 
    })

  } catch (error) {
    console.error('Error removing Spotify tokens:', error)
    return NextResponse.json({ 
      error: 'Failed to remove tokens' 
    }, { status: 500 })
  }
} 