import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'messages.db')
    db = new Database(dbPath)
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS repository_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL DEFAULT 'default',
        hidden_repos TEXT DEFAULT '[]',
        featured_repos TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
      
      CREATE TABLE IF NOT EXISTS activity_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL DEFAULT 'default',
        show_discord BOOLEAN DEFAULT TRUE,
        show_spotify BOOLEAN DEFAULT TRUE,
        show_coding BOOLEAN DEFAULT TRUE,
        show_gaming BOOLEAN DEFAULT TRUE,
        show_general BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
      
      INSERT OR IGNORE INTO repository_settings (user_id, hidden_repos, featured_repos) 
      VALUES ('default', '[]', '[]');
      
      INSERT OR IGNORE INTO activity_settings (user_id) 
      VALUES ('default');
    `)
  }
  return db
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
  created_at: string
  updated_at: string
}

export async function createMessage(data: {
  name: string
  email: string
  subject: string
  message: string
  ip_address?: string
  user_agent?: string
}): Promise<Message> {
  const database = getDatabase()
  const stmt = database.prepare(`
    INSERT INTO messages (name, email, subject, message, ip_address, user_agent) 
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  const result = stmt.run(data.name, data.email, data.subject, data.message, data.ip_address, data.user_agent)
  
  const selectStmt = database.prepare('SELECT * FROM messages WHERE id = ?')
  return selectStmt.get(result.lastInsertRowid) as Message
}

export async function getMessages(): Promise<Message[]> {
  const database = getDatabase()
  const stmt = database.prepare('SELECT * FROM messages ORDER BY created_at DESC')
  return stmt.all() as Message[]
}

export async function markMessageAsRead(id: number): Promise<void> {
  const database = getDatabase()
  const stmt = database.prepare('UPDATE messages SET read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
  stmt.run(id)
}

export async function getUnreadMessagesCount(): Promise<number> {
  const database = getDatabase()
  const stmt = database.prepare('SELECT COUNT(*) as count FROM messages WHERE read = FALSE')
  const result = stmt.get() as { count: number }
  return result.count
}

export async function deleteMessage(id: number): Promise<boolean> {
  const database = getDatabase()
  const stmt = database.prepare('DELETE FROM messages WHERE id = ?')
  const result = stmt.run(id)
  return result.changes > 0
}

export interface RepositorySettings {
  id: number
  user_id: string
  hidden_repos: string[]
  featured_repos: string[]
  created_at: string
  updated_at: string
}

export async function getRepositorySettings(userId: string = 'default'): Promise<RepositorySettings | null> {
  const database = getDatabase()
  const stmt = database.prepare('SELECT * FROM repository_settings WHERE user_id = ?')
  const result = stmt.get(userId) as any
  
  if (!result) return null
  
  return {
    ...result,
    hidden_repos: JSON.parse(result.hidden_repos || '[]'),
    featured_repos: JSON.parse(result.featured_repos || '[]')
  }
}

export async function updateRepositorySettings(
  userId: string = 'default',
  settings: { hidden_repos?: string[]; featured_repos?: string[] }
): Promise<RepositorySettings> {
  const database = getDatabase()
  
  const updateFields: string[] = []
  const values: any[] = []

  if (settings.hidden_repos !== undefined) {
    updateFields.push('hidden_repos = ?')
    values.push(JSON.stringify(settings.hidden_repos))
  }

  if (settings.featured_repos !== undefined) {
    updateFields.push('featured_repos = ?')
    values.push(JSON.stringify(settings.featured_repos))
  }

  if (updateFields.length > 0) {
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(userId)

    const stmt = database.prepare(`
      UPDATE repository_settings 
      SET ${updateFields.join(', ')} 
      WHERE user_id = ?
    `)
    stmt.run(...values)
  }

  const selectStmt = database.prepare('SELECT * FROM repository_settings WHERE user_id = ?')
  const result = selectStmt.get(userId) as any
  
  return {
    ...result,
    hidden_repos: JSON.parse(result.hidden_repos || '[]'),
    featured_repos: JSON.parse(result.featured_repos || '[]')
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
  created_at: string
  updated_at: string
}

export async function getActivitySettings(userId: string = 'default'): Promise<ActivitySettings | null> {
  const database = getDatabase()
  const stmt = database.prepare('SELECT * FROM activity_settings WHERE user_id = ?')
  return stmt.get(userId) as ActivitySettings | null
}

export async function updateActivitySettings(
  userId: string = 'default',
  settings: Partial<Omit<ActivitySettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ActivitySettings> {
  const database = getDatabase()
  
  const updateFields: string[] = []
  const values: any[] = []

  Object.entries(settings).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = ?`)
      values.push(value)
    }
  })

  if (updateFields.length > 0) {
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    values.push(userId)

    const stmt = database.prepare(`
      UPDATE activity_settings 
      SET ${updateFields.join(', ')} 
      WHERE user_id = ?
    `)
    stmt.run(...values)
  }

  const selectStmt = database.prepare('SELECT * FROM activity_settings WHERE user_id = ?')
  return selectStmt.get(userId) as ActivitySettings
}