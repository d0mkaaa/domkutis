import { NextResponse } from 'next/server'

interface LanyardActivity {
  name: string;
  details?: string;
  state?: string;
  type: number;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

interface LanyardResponse {
  success: boolean;
  data: {
    discord_status: 'online' | 'idle' | 'dnd' | 'offline';
    activities: LanyardActivity[];
    kv: {
      spotify?: string;
      custom_status?: {
        text?: string;
        emoji?: {
          name: string;
          id?: string;
          animated?: boolean;
        };
      };
    };
  };
}

interface EnhancedActivity {
  name: string;
  details: string;
  originalDetails?: string;
  state?: string;
  type: number;
  category: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
}

export async function GET() {
  try {
    try {
      const response = await fetch('https://api.lanyard.rest/v1/users/281476113465065472')
      
      if (!response.ok) {
        throw new Error('Failed to fetch Discord presence')
      }
      
      const data: LanyardResponse = await response.json()
      
      if (!data.success) {
        throw new Error('Discord user not found or not using Lanyard')
      }
      
      const presence = data.data

      let activity: EnhancedActivity | null = null
      let discordStatus = presence.discord_status 
      
      if (presence.activities && presence.activities.length > 0) {
        const relevantActivity = presence.activities.find(
          (act) => act.name !== 'Spotify' && act.type !== 2 
        )
        
        if (relevantActivity) {
          let enhancedDetails = relevantActivity.details || ''
          let activityCategory = 'unknown'

          const codingApps = ['Visual Studio Code', 'VS Code', 'IntelliJ', 'WebStorm', 'Atom', 'Sublime Text', 'Vim', 'Emacs', 'Code']
          if (codingApps.some(app => relevantActivity.name.includes(app))) {
            activityCategory = 'coding'

            if (relevantActivity.details) {
              const fileMatch = relevantActivity.details.match(/([^\s]+\.[a-zA-Z]+)/i)
              if (fileMatch) {
                const fileName = fileMatch[1]
                const fileIcon = getFileIcon(fileName)
                enhancedDetails = `${fileIcon} Editing ${fileName}`
              } else if (relevantActivity.details.includes('Editing')) {
                enhancedDetails = `💻 ${relevantActivity.details}`
              }
            }
          } else if (relevantActivity.type === 0) { 
            const gamingApps = ['VALORANT', 'League of Legends', 'CS2', 'Counter-Strike', 'Dota 2', 'Overwatch', 'Apex Legends', 'Fortnite', 'Rocket League', 'Minecraft', 'Among Us']
            if (gamingApps.some(game => relevantActivity.name.includes(game))) {
              activityCategory = 'gaming'
              if (relevantActivity.name.includes('VALORANT')) {
                enhancedDetails = `🎯 ${relevantActivity.details || 'Playing VALORANT'}`
              } else if (relevantActivity.name.includes('League')) {
                enhancedDetails = `⚔️ ${relevantActivity.details || 'Playing League of Legends'}`
              } else {
                enhancedDetails = `🎮 ${relevantActivity.details || relevantActivity.name}`
              }
            }
          } else if (relevantActivity.name.includes('Discord')) {
            activityCategory = 'communication'
            if (relevantActivity.details?.toLowerCase().includes('voice') || 
                relevantActivity.state?.toLowerCase().includes('voice')) {
              enhancedDetails = `🎤 In voice: ${relevantActivity.state || 'General'}`
            }
          }
          
          activity = {
            name: relevantActivity.name,
            details: enhancedDetails,
            originalDetails: relevantActivity.details,
            state: relevantActivity.state,
            type: relevantActivity.type,
            category: activityCategory,
            timestamps: relevantActivity.timestamps,
            assets: relevantActivity.assets
          }
        }
      }

      return NextResponse.json({
        status: discordStatus,
        activity: activity,
        customStatus: presence.kv || {}, 
        lastSeen: new Date().toISOString()
      })
      
    } catch (lanyardError) {
      console.log('Lanyard API not available, using fallback')

      const mockActivities: EnhancedActivity[] = [
        {
          name: 'Visual Studio Code',
          details: '🔷 Editing route.ts',
          originalDetails: 'Editing route.ts',
          state: 'Working on API routes',
          type: 0,
          category: 'coding',
          timestamps: { start: Date.now() - 3600000 },
          assets: {
            large_image: 'vscode',
            large_text: 'Visual Studio Code'
          }
        },
        {
          name: 'Visual Studio Code', 
          details: '⚛️ Creating components',
          originalDetails: 'Editing StatusWidget.tsx',
          state: 'Working on portfolio components',
          type: 0,
          category: 'coding',
          timestamps: { start: Date.now() - 2400000 },
          assets: {
            large_image: 'vscode',
            large_text: 'Visual Studio Code'
          }
        },
        {
          name: 'VALORANT',
          details: '🎯 Competitive Match',
          originalDetails: 'Competitive Match',
          state: 'Haven • 12-10',
          type: 0,
          category: 'gaming',
          timestamps: { start: Date.now() - 1800000 },
          assets: {
            large_image: 'valorant',
            large_text: 'VALORANT'
          }
        },
        {
          name: 'Discord',
          details: '🎤 In voice: General',
          originalDetails: 'In a voice channel',
          state: 'General',
          type: 0,
          category: 'communication',
          timestamps: { start: Date.now() - 600000 },
          assets: {
            large_image: 'discord',
            large_text: 'Discord'
          }
        }
      ]

      const randomActivity = Math.random() > 0.3 
        ? mockActivities[Math.floor(Math.random() * mockActivities.length)]
        : null
      
      return NextResponse.json({
        status: 'online',
        activity: randomActivity,
        customStatus: {},
        lastSeen: new Date().toISOString(),
        source: 'mock' 
      })
    }
    
  } catch (error) {
    console.error('Discord activity API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Discord activity',
      status: 'unknown',
      activity: null
    }, { 
      status: 500 
    })
  }
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Discord status update endpoint (requires Lanyard setup)' 
  })
}

function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  switch (ext) {
    case 'ts': case 'tsx': return '🔷'
    case 'js': case 'jsx': return '🟡' 
    case 'py': return '🐍'
    case 'css': case 'scss': return '🎨'
    case 'html': return '🌐'
    case 'json': return '📋'
    case 'md': return '📝'
    case 'env': return '⚙️'
    case 'yml': case 'yaml': return '📄'
    case 'sql': return '🗃️'
    case 'php': return '🐘'
    case 'java': return '☕'
    case 'cpp': case 'c': return '⚡'
    case 'rs': return '🦀'
    case 'go': return '🐹'
    default: return '📄'
  }
}