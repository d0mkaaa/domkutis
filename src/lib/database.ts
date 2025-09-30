import { supabase, supabaseAdmin, type Message, type AuthToken, type RepositorySettings, type ActivitySettings } from './supabase'

export async function saveMessage(messageData: {
  name: string
  email: string
  subject: string
  message: string
  company?: string
  projectType?: string
  timestamp?: string
  ip_address?: string
  user_agent?: string
}) {
  try {
    const client = supabaseAdmin === supabase ? supabase : supabaseAdmin

    const { data, error } = await client
      .from('messages')
      .insert([{
        name: messageData.name,
        email: messageData.email,
        subject: messageData.subject,
        message: messageData.message,
        company: messageData.company,
        project_type: messageData.projectType,
        timestamp: messageData.timestamp,
        ip_address: messageData.ip_address,
        user_agent: messageData.user_agent
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error details:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error saving message:', error)
    throw new Error('Failed to save message')
  }
}

export async function getMessages() {
  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Message[]
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw new Error('Failed to fetch messages')
  }
}

export async function deleteMessage(id: number) {
  try {
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting message:', error)
    throw new Error('Failed to delete message')
  }
}

export async function getAuthToken(service: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('auth_tokens')
      .select('*')
      .eq('service', service)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data as AuthToken | null
  } catch (error) {
    console.error('Error getting auth token:', error)
    throw new Error('Failed to get auth token')
  }
}

export async function saveAuthToken(service: string, token: string, refreshToken?: string, expiresAt?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('auth_tokens')
      .upsert([{
        service,
        token,
        refresh_token: refreshToken,
        expires_at: expiresAt
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving auth token:', error)
    throw new Error('Failed to save auth token')
  }
}

export async function getRepositorySettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from('repository_settings')
      .select('*')
      .eq('user_id', 'default')
      .single()

    if (error && error.code !== 'PGRST116') throw error

    if (!data) {
      const { data: newData, error: insertError } = await supabaseAdmin
        .from('repository_settings')
        .insert([{
          user_id: 'default',
          hidden_repos: [],
          featured_repos: []
        }])
        .select()
        .single()

      if (insertError) throw insertError
      return newData as RepositorySettings
    }

    return data as RepositorySettings
  } catch (error) {
    console.error('Error getting repository settings:', error)
    throw new Error('Failed to get repository settings')
  }
}

export async function saveRepositorySettings(hiddenRepos: string[], featuredRepos: string[]) {
  try {
    const { data, error } = await supabaseAdmin
      .from('repository_settings')
      .upsert([{
        user_id: 'default',
        hidden_repos: hiddenRepos,
        featured_repos: featuredRepos
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving repository settings:', error)
    throw new Error('Failed to save repository settings')
  }
}

export async function getActivitySettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_settings')
      .select('*')
      .eq('user_id', 'default')
      .single()

    if (error && error.code !== 'PGRST116') throw error

    if (!data) {
      const { data: newData, error: insertError } = await supabaseAdmin
        .from('activity_settings')
        .insert([{
          user_id: 'default',
          show_discord: true,
          show_spotify: true,
          show_general: true
        }])
        .select()
        .single()

      if (insertError) throw insertError
      return newData as ActivitySettings
    }

    return data as ActivitySettings
  } catch (error) {
    console.error('Error getting activity settings:', error)
    throw new Error('Failed to get activity settings')
  }
}

export async function saveActivitySettings(settings: {
  showDiscord: boolean
  showSpotify: boolean
  showGeneral: boolean
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from('activity_settings')
      .upsert([{
        user_id: 'default',
        show_discord: settings.showDiscord,
        show_spotify: settings.showSpotify,
        show_general: settings.showGeneral
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving activity settings:', error)
    throw new Error('Failed to save activity settings')
  }
}

export const createMessage = saveMessage
export const updateActivitySettings = saveActivitySettings
export const updateRepositorySettings = saveRepositorySettings

export async function getUnreadMessagesCount() {
  try {
    const { count, error } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error getting unread messages count:', error)
    return 0
  }
}

export async function markMessageAsRead(id: number) {
  try {
    const { error } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking message as read:', error)
    throw new Error('Failed to mark message as read')
  }
}

export async function deleteAuthToken(service: string) {
  try {
    const { error } = await supabaseAdmin
      .from('auth_tokens')
      .delete()
      .eq('service', service)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting auth token:', error)
    throw new Error('Failed to delete auth token')
  }
}