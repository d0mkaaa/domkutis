import { Pool } from 'pg'

let pool: Pool | null = null

export function getDatabase() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/domkutis',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

export interface Message {
  id: number
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  ip_address?: string
  user_agent?: string
  created_at: Date
  updated_at: Date
}

export async function createMessage(data: {
  name: string
  email: string
  subject: string
  message: string
  ip_address?: string
  user_agent?: string
}): Promise<Message> {
  const db = getDatabase()
  const result = await db.query(
    `INSERT INTO messages (name, email, subject, message, ip_address, user_agent) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [data.name, data.email, data.subject, data.message, data.ip_address, data.user_agent]
  )
  return result.rows[0]
}

export async function getMessages(): Promise<Message[]> {
  const db = getDatabase()
  const result = await db.query('SELECT * FROM messages ORDER BY created_at DESC')
  return result.rows
}

export async function markMessageAsRead(id: number): Promise<void> {
  const db = getDatabase()
  await db.query('UPDATE messages SET read = TRUE WHERE id = $1', [id])
}

export async function getUnreadMessagesCount(): Promise<number> {
  const db = getDatabase()
  const result = await db.query('SELECT COUNT(*) FROM messages WHERE read = FALSE')
  return parseInt(result.rows[0].count)
}

export interface RepositorySettings {
  id: number
  user_id: string
  hidden_repos: string[]
  featured_repos: string[]
  created_at: Date
  updated_at: Date
}

export async function getRepositorySettings(userId: string = 'default'): Promise<RepositorySettings | null> {
  const db = getDatabase()
  const result = await db.query('SELECT * FROM repository_settings WHERE user_id = $1', [userId])
  if (result.rows.length === 0) {
    return null
  }
  return {
    ...result.rows[0],
    hidden_repos: result.rows[0].hidden_repos || [],
    featured_repos: result.rows[0].featured_repos || []
  }
}

export async function updateRepositorySettings(
  userId: string = 'default',
  settings: { hidden_repos?: string[]; featured_repos?: string[] }
): Promise<RepositorySettings> {
  const db = getDatabase()
  
  const updateFields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (settings.hidden_repos !== undefined) {
    updateFields.push(`hidden_repos = $${paramIndex}`)
    values.push(JSON.stringify(settings.hidden_repos))
    paramIndex++
  }

  if (settings.featured_repos !== undefined) {
    updateFields.push(`featured_repos = $${paramIndex}`)
    values.push(JSON.stringify(settings.featured_repos))
    paramIndex++
  }

  values.push(userId)

  const result = await db.query(
    `UPDATE repository_settings 
     SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
     WHERE user_id = $${paramIndex}
     RETURNING *`,
    values
  )

  if (result.rows.length === 0) {
    
    const createResult = await db.query(
      `INSERT INTO repository_settings (user_id, hidden_repos, featured_repos) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [userId, JSON.stringify(settings.hidden_repos || []), JSON.stringify(settings.featured_repos || [])]
    )
    return {
      ...createResult.rows[0],
      hidden_repos: createResult.rows[0].hidden_repos || [],
      featured_repos: createResult.rows[0].featured_repos || []
    }
  }

  return {
    ...result.rows[0],
    hidden_repos: result.rows[0].hidden_repos || [],
    featured_repos: result.rows[0].featured_repos || []
  }
}

export interface ActivitySettings {
  id: number
  user_id: string
  show_discord: boolean
  show_spotify: boolean
  show_coding: boolean
  show_gaming: boolean
  show_general: boolean
  created_at: Date
  updated_at: Date
}

export async function getActivitySettings(userId: string = 'default'): Promise<ActivitySettings | null> {
  const db = getDatabase()
  const result = await db.query('SELECT * FROM activity_settings WHERE user_id = $1', [userId])
  return result.rows.length > 0 ? result.rows[0] : null
}

export async function updateActivitySettings(
  userId: string = 'default',
  settings: Partial<Omit<ActivitySettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ActivitySettings> {
  const db = getDatabase()
  
  const updateFields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  Object.entries(settings).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  values.push(userId)

  const result = await db.query(
    `UPDATE activity_settings 
     SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
     WHERE user_id = $${paramIndex}
     RETURNING *`,
    values
  )

  if (result.rows.length === 0) {
    
    const createResult = await db.query(
      `INSERT INTO activity_settings (user_id, show_discord, show_spotify, show_coding, show_gaming, show_general) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, true, true, true, true, true]
    )
    return createResult.rows[0]
  }

  return result.rows[0]
}