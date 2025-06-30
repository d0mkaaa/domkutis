'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Music, 
  Activity, 
  MessageCircle, 
  Settings, 
  RefreshCw, 
  LogOut, 
  Eye, 
  EyeOff,
  Mail,
  Bell,
  Monitor,
  Gamepad2,
  Code,
  ToggleLeft,
  ToggleRight,
  Github,
  Star,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string
  global_name?: string
}

interface SpotifyTrack {
  name: string
  artists: Array<{
    name: string
    url: string
  }>
  album: {
    name: string
    url: string
  }
  images: {
    large: string | null
    medium: string | null
    small: string | null
  }
  isPlaying: boolean
  progress: number
  duration: number
  external_url: string
  explicit: boolean
  popularity: number
  preview_url: string | null
  fetchedAt: number
}

interface ActivityStatus {
  type: 'coding' | 'gaming' | 'listening' | 'idle'
  details: string
  application?: string
  timestamp: number
}

interface DiscordActivity {
  name: string
  details?: string
  state?: string
  type: number
  application_id?: string
  timestamps?: {
    start?: number
    end?: number
  }
  assets?: {
    large_image?: string
    large_text?: string
    small_image?: string
    small_text?: string
  }
}

interface DiscordPresence {
  status: 'online' | 'idle' | 'dnd' | 'offline'
  activity: DiscordActivity | null
  customStatus: any
  lastSeen: string
  source?: string
}

interface Repository {
  id: string;
  name: string;
  description: string;
  stargazers_count: number;
  language: string;
}

interface RepoSettings {
  allRepos: Repository[];
  hiddenRepos: string[];
  featuredRepos: string[];
}

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

interface MessagesResponse {
  messages: Message[]
  totalCount: number
  unreadCount: number
  timestamp: string
}

export default function Dashboard() {
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [activity, setActivity] = useState<ActivityStatus | null>(null)
  const [isPublicVisible, setIsPublicVisible] = useState(true)
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(null)
  const [liveProgress, setLiveProgress] = useState(0)
  const [discordPresence, setDiscordPresence] = useState<DiscordPresence | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [githubData, setGithubData] = useState<{
    todaysCommits: number;
    activeRepos: number;
    followers: number;
    totalStars: number;
    recentActivity: any[];
  } | null>(null)
  const [activitySettings, setActivitySettings] = useState({
    showDiscord: true,
    showSpotify: true,
    showCoding: true,
    showGaming: true,
    showGeneral: true
  })
  const [repoSettings, setRepoSettings] = useState<{
    hiddenRepos: string[]
    featuredRepos: string[]
    allRepos: any[]
  }>({
    hiddenRepos: [],
    featuredRepos: [],
    allRepos: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authKey, setAuthKey] = useState('')
  const [stats, setStats] = useState({ total: 0, unread: 0 })

  const AUTHORIZED_USER_ID = process.env.NEXT_PUBLIC_DISCORD_USER_ID || "578600798842519563"
  const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "6b495025ba32453194ea7d4ac5916825"
  const SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || 
    (() => {
      if (typeof window === 'undefined') return 'http://localhost:3000/dashboard'
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.NEXT_PUBLIC_PROD_URL || window.location.origin)
        : (process.env.NEXT_PUBLIC_DEV_URL || window.location.origin)
      
      return `${baseUrl}/dashboard`
    })()

  const fetchGitHubData = async () => {
    try {
      const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'd0mkaaa'
      
      const [userResponse, reposResponse, eventsResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos`),
        fetch(`https://api.github.com/users/${username}/events/public`)
      ])

      if (userResponse.ok && reposResponse.ok && eventsResponse.ok) {
        const [userData, reposData, eventsData] = await Promise.all([
          userResponse.json(),
          reposResponse.json(),
          eventsResponse.json()
        ])

        const today = new Date().toDateString()
        const todaysCommits = eventsData.filter((event: any) => 
          event.type === 'PushEvent' && 
          new Date(event.created_at).toDateString() === today
        ).reduce((total: number, event: any) => total + (event.payload?.commits?.length || 0), 0)

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const activeRepos = reposData.filter((repo: any) => 
          new Date(repo.updated_at) > thirtyDaysAgo
        ).length

        const totalStars = reposData.reduce((total: number, repo: any) => total + repo.stargazers_count, 0)

        setGithubData({
          todaysCommits,
          activeRepos,
          followers: userData.followers,
          totalStars,
          recentActivity: eventsData.slice(0, 5)
        })

        setRepoSettings(prev => ({
          ...prev,
          allRepos: reposData
        }))
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error)
    }
  }

  const loginWithDiscord = async () => {
    setIsLoading(true)
    
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
    if (!clientId) {
      console.error('Discord Client ID not configured')
      setIsLoading(false)
      return
    }
    
    const redirectUri = process.env.NODE_ENV === 'production'
      ? `${process.env.NEXT_PUBLIC_PROD_URL}/dashboard`
      : `${process.env.NEXT_PUBLIC_DEV_URL}/dashboard`
    
    const scope = 'identify'
    const state = Math.random().toString(36).substring(7)
    
    localStorage.setItem('discord_auth_state', state)
    
    const discordAuthUrl = `https://discord.com/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`
    
    window.location.href = discordAuthUrl
  }

  const connectSpotify = async () => {
    const scope = 'user-read-currently-playing user-read-playback-state user-read-recently-played'
    const state = Math.random().toString(36).substring(7)
    
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${SPOTIFY_CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}`
    
    localStorage.setItem('spotify_auth_state', state)
    window.location.href = spotifyAuthUrl
  }

  const exchangeSpotifyCode = async (code: string) => {
    try {
      
      const response = await fetch('/api/spotify/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Token exchange failed')
      }

      const tokenData = await response.json()
      
      setSpotifyAccessToken(tokenData.access_token)
      setSpotifyConnected(true)

      localStorage.setItem('spotify_token', tokenData.access_token)
      if (tokenData.refresh_token) {
        localStorage.setItem('spotify_refresh_token', tokenData.refresh_token)
      }

      const expiryTime = Date.now() + (tokenData.expires_in * 1000)
      localStorage.setItem('spotify_token_expiry', expiryTime.toString())

      fetchCurrentTrack(tokenData.access_token)
      
      console.log('Spotify connected successfully!')
    } catch (error) {
      console.error('Spotify token exchange failed:', error)
      alert('Failed to connect to Spotify. Please try again.')
    }
  }

  const fetchCurrentTrack = async (token: string) => {
    try {
      
      const expiryTime = localStorage.getItem('spotify_token_expiry')
      if (expiryTime && Date.now() > parseInt(expiryTime)) {
        console.log('Spotify token expired')
        disconnectSpotify()
        return
      }

      const response = await fetch('/api/spotify/current-track', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        
        console.log('Spotify token invalid, disconnecting...')
        disconnectSpotify()
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch current track')
      }

      const trackData = await response.json()
      
      if (trackData.error) {
        throw new Error(trackData.error)
      }

      if (trackData.isPlaying === false || !trackData.name) {
        
        setCurrentTrack(null)

        setActivity({
          type: 'idle',
          details: 'probably debugging something right now tbh',
          timestamp: Date.now()
        })
      } else {
        
        setCurrentTrack(trackData)

        setActivity({
          type: 'listening',
          details: `Listening to ${trackData.name}`,
          application: 'Spotify',
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error('Failed to fetch current track:', error)

      setCurrentTrack(null)
      setActivity({
        type: 'idle',
        details: 'probably debugging something right now tbh',
        timestamp: Date.now()
      })
    }
  }

  const fetchDiscordActivity = async () => {
    try {
      const response = await fetch('/api/discord/activity')
      if (response.ok) {
        const data = await response.json()
        setDiscordPresence(data)

        if (data.activity && !currentTrack) {
          let activityType: 'coding' | 'gaming' | 'listening' | 'idle' = 'idle'

          if (data.activity.name.toLowerCase().includes('code') || 
              data.activity.name.toLowerCase().includes('vs') ||
              data.activity.name.toLowerCase().includes('editor')) {
            activityType = 'coding'
          } else if (data.activity.type === 0 && 
                     (data.activity.name.toLowerCase().includes('game') ||
                      data.activity.name.includes('VALORANT') ||
                      data.activity.name.includes('League') ||
                      data.activity.name.includes('CS2'))) {
            activityType = 'gaming'
          }
          
          setActivity({
            type: activityType,
            details: data.activity.details || `Playing ${data.activity.name}`,
            application: data.activity.name,
            timestamp: data.activity.timestamps?.start || Date.now()
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch Discord activity:', error)
    }
  }

  const fetchMessages = async (token?: string) => {
    try {
      const headers: HeadersInit = {}
      
      if (authKey) {
        headers['x-api-key'] = authKey
      } else if (token) {
        headers['discord-token'] = token
      } else {
        throw new Error('No authentication method available')
      }

      const response = await fetch('/api/messages', { headers })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch messages: ${response.status}`)
      }

      const data: MessagesResponse = await response.json()
      setMessages(data.messages)
      setUnreadCount(data.unreadCount)
      setStats({ total: data.totalCount, unread: data.unreadCount })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setError(String(err))
      setMessages([])
      setUnreadCount(0)
      setStats({ total: 0, unread: 0 })
      throw err
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthenticated(true)
    try {
      await fetchMessages(authKey)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setError('Failed to authenticate. Please check your API key.')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const headers: HeadersInit = {}
      
      if (authKey) {
        headers['x-api-key'] = authKey
      } else if (user) {
        const token = localStorage.getItem('discord_token')
        if (token) headers['discord-token'] = token
      }

      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: 'PATCH',
        headers
      })

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
        setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }))
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to mark message as read:', errorData.error)
      }
    } catch (err) {
      console.error('Failed to mark message as read:', err)
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const headers: HeadersInit = {}
      
      if (authKey) {
        headers['x-api-key'] = authKey
      } else if (user) {
        const token = localStorage.getItem('discord_token')
        if (token) headers['discord-token'] = token
      }

      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: 'DELETE',
        headers
      })

      if (response.ok) {
        const messageToDelete = messages.find(m => m.id === messageId)
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
        setUnreadCount(prev => messageToDelete?.read ? prev : Math.max(0, prev - 1))
        setStats(prev => ({ 
          total: prev.total - 1, 
          unread: messageToDelete?.read ? prev.unread : Math.max(0, prev.unread - 1)
        }))
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to delete message:', errorData.error)
      }
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  const disconnectSpotify = () => {
    setSpotifyConnected(false)
    setSpotifyAccessToken(null)
    setCurrentTrack(null)
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_token_expiry')
    localStorage.removeItem('spotify_auth_state')
  }

  const logout = () => {
    setUser(null)
    setCurrentTrack(null)
    setActivity(null)
    setSpotifyConnected(false)
    setSpotifyAccessToken(null)
    localStorage.removeItem('discord_token')
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('spotify_auth_state')
  }

  const toggleRepoVisibility = async (repoName: string) => {
    setRepoSettings(prev => {
      const newHiddenRepos = prev.hiddenRepos.includes(repoName)
        ? prev.hiddenRepos.filter(name => name !== repoName)
        : [...prev.hiddenRepos, repoName]
      
      const newSettings = { ...prev, hiddenRepos: newHiddenRepos }
      localStorage.setItem('dashboard_repo_settings', JSON.stringify({
        hiddenRepos: newSettings.hiddenRepos,
        featuredRepos: newSettings.featuredRepos
      }))
      
      const discordToken = localStorage.getItem('discord_token')
      fetch('/api/settings/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'discord-token': discordToken || ''
        },
        body: JSON.stringify({
          hidden_repos: newSettings.hiddenRepos,
          featured_repos: newSettings.featuredRepos
        })
      }).catch(error => console.error('Failed to save repo settings:', error))
      
      return newSettings
    })
  }

  const toggleRepoFeatured = async (repoName: string) => {
    setRepoSettings(prev => {
      const newFeaturedRepos = prev.featuredRepos.includes(repoName)
        ? prev.featuredRepos.filter(name => name !== repoName)
        : [...prev.featuredRepos, repoName]
      
      const newSettings = { ...prev, featuredRepos: newFeaturedRepos }
      localStorage.setItem('dashboard_repo_settings', JSON.stringify({
        hiddenRepos: newSettings.hiddenRepos,
        featuredRepos: newSettings.featuredRepos
      }))
      
      const discordToken = localStorage.getItem('discord_token')
      fetch('/api/settings/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'discord-token': discordToken || ''
        },
        body: JSON.stringify({
          hidden_repos: newSettings.hiddenRepos,
          featured_repos: newSettings.featuredRepos
        })
      }).catch(error => console.error('Failed to save repo settings:', error))
      
      return newSettings
    })
  }

  const exchangeDiscordCode = async (code: string, state: string) => {
    try {
      const storedState = localStorage.getItem('discord_auth_state')
      if (state !== storedState) {
        console.error('State mismatch in Discord OAuth callback')
        return
      }

      const redirectUri = process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_PROD_URL}/dashboard`
        : `${process.env.NEXT_PUBLIC_DEV_URL}/dashboard`

      const response = await fetch('/api/discord/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, redirectUri })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Discord authentication failed')
      }

      const data = await response.json()
      
      if (data.user.id !== AUTHORIZED_USER_ID) {
        alert('Access denied. This dashboard is restricted to authorized users only.')
        logout()
        return
      }

      setUser(data.user)
      localStorage.setItem('discord_token', data.access_token)
      localStorage.removeItem('discord_auth_state')
      
      window.history.replaceState({}, document.title, '/dashboard')
      
      console.log('Discord authentication successful!')
    } catch (error) {
      console.error('Discord authentication failed:', error)
      alert('Failed to authenticate with Discord. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')
    
    if (error) {
      console.error('OAuth error:', error)
      return
    }
    
    if (code && state) {
      const spotifyState = localStorage.getItem('spotify_auth_state')
      const discordState = localStorage.getItem('discord_auth_state')
      
      if (state === spotifyState) {
        exchangeSpotifyCode(code)
        window.history.replaceState({}, document.title, '/dashboard')
      } else if (state === discordState) {
        exchangeDiscordCode(code, state)
        return
      } else {
        console.error('State mismatch in OAuth callback')
        setIsLoading(false)
      }
    }

    const savedDiscordToken = localStorage.getItem('discord_token')
    const savedSpotifyToken = localStorage.getItem('spotify_token')
    
    if (savedDiscordToken) {
      fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${savedDiscordToken}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error('Token invalid')
        }
      })
      .then(userData => {
        if (userData.id === AUTHORIZED_USER_ID) {
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          logout()
        }
      })
      .catch(() => {
        logout()
      })
    }
    
    if (savedSpotifyToken) {
      setSpotifyAccessToken(savedSpotifyToken)
      setSpotifyConnected(true)
      fetchCurrentTrack(savedSpotifyToken)
    }

    if (savedDiscordToken) {
      fetchDiscordActivity()
      fetchMessages(savedDiscordToken)
      fetchGitHubData()
    }

    const storedRepoSettings = localStorage.getItem('dashboard_repo_settings')
    if (storedRepoSettings) {
      const parsed = JSON.parse(storedRepoSettings)
      setRepoSettings(prev => ({
        ...prev,
        hiddenRepos: parsed.hiddenRepos || [],
        featuredRepos: parsed.featuredRepos || []
      }))
    }

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    if (!spotifyAccessToken || !spotifyConnected) return

    const interval = setInterval(() => {
      fetchCurrentTrack(spotifyAccessToken)
    }, 15000) 

    return () => clearInterval(interval)
  }, [spotifyAccessToken, spotifyConnected])

  useEffect(() => {
    if (!currentTrack || !currentTrack.isPlaying) return

    const updateProgress = () => {
      const timeSinceFetch = Date.now() - currentTrack.fetchedAt
      const newProgress = currentTrack.progress + timeSinceFetch
      
      if (newProgress < currentTrack.duration) {
        setLiveProgress(newProgress)
      }
    }

    updateProgress() 
    const progressInterval = setInterval(updateProgress, 1000)
    
    return () => clearInterval(progressInterval)
  }, [currentTrack])

  useEffect(() => {
    if (currentTrack) {
      setLiveProgress(currentTrack.progress)
    }
  }, [currentTrack?.name, currentTrack?.progress])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchDiscordActivity()
    }, 30000) 

    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (!user || currentTrack || (discordPresence?.activity)) return

    const interval = setInterval(() => {
      const activities: ActivityStatus[] = [
        {
          type: 'coding',
          details: 'Working on domkutis.com',
          application: 'Visual Studio Code',
          timestamp: Date.now()
        },
        {
          type: 'idle',
          details: 'probably debugging something right now tbh',
          timestamp: Date.now()
        }
      ]

      setActivity(activities[Math.floor(Math.random() * activities.length)])
    }, 60000) 

    return () => clearInterval(interval)
  }, [user, currentTrack, discordPresence?.activity])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchGitHubData()
    }, 300000) 

    return () => clearInterval(interval)
  }, [user])

    if (!user && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 space-y-6">
            <div className="text-center space-y-2">
              <Shield className="w-12 h-12 text-primary mx-auto" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Login to access your dashboard</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={loginWithDiscord}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    <span>Login with Discord</span>
                  </>
                )}
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
              
              <form onSubmit={handleAuth} className="space-y-3">
                <input
                  type="password"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  className="w-full form-input"
                  placeholder="Admin API Key"
                />
                <button
                  type="submit"
                  disabled={!authKey.trim()}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Access with API Key
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
              </div>
              </div>
    )
                      }

  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <img 
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.global_name || user.username}
                  </h1>
                  <p className="text-muted-foreground">Dashboard</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPublicVisible(!isPublicVisible)}
              className="flex items-center space-x-2 px-3 py-2 glass-card hover:bg-muted/50 transition-colors"
            >
              {isPublicVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-sm">
                {isPublicVisible ? 'Public' : 'Private'}
              </span>
            </button>
            
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 glass-card hover:bg-red-500/20 text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-1 glass-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'messages' && unreadCount > 0 && (
                <span className="ml-1 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Messages</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  {unreadCount > 0 && (
                    <p className="text-sm text-orange-500 mt-1">
                      {unreadCount} unread
                    </p>
                  )}
                </div>

                {githubData && (
                  <>
                    <div className="glass-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Today's Commits</p>
                          <p className="text-2xl font-bold">{githubData.todaysCommits}</p>
                        </div>
                        <Code className="w-8 h-8 text-green-500" />
                      </div>
                    </div>

                    <div className="glass-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Stars</p>
                          <p className="text-2xl font-bold">{githubData.totalStars}</p>
                        </div>
                        <Star className="w-8 h-8 text-yellow-500" />
                      </div>
                    </div>

                    <div className="glass-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Repos</p>
                          <p className="text-2xl font-bold">{githubData.activeRepos}</p>
                        </div>
                        <Github className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Music className="w-5 h-5 text-green-500" />
                      Spotify
                    </h3>
                    {!spotifyConnected ? (
                      <button
                        onClick={connectSpotify}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                      >
                        Connect
                      </button>
                    ) : (
                      <button
                        onClick={disconnectSpotify}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>

                  {currentTrack ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        {currentTrack.images.small && (
                          <img 
                            src={currentTrack.images.small} 
                            alt="Album Art"
                            className="w-16 h-16 rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{currentTrack.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {currentTrack.artists.map(a => a.name).join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {currentTrack.album.name}
                          </p>
                        </div>
                      </div>

                      {currentTrack.isPlaying && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{Math.floor(liveProgress / 60000)}:{String(Math.floor((liveProgress % 60000) / 1000)).padStart(2, '0')}</span>
                            <span>{Math.floor(currentTrack.duration / 60000)}:{String(Math.floor((currentTrack.duration % 60000) / 1000)).padStart(2, '0')}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${(liveProgress / currentTrack.duration) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {spotifyConnected ? 'Not currently playing' : 'Connect Spotify to see current track'}
                    </p>
                  )}
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Activity
                  </h3>

                  {discordPresence?.activity ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        {discordPresence.activity.assets?.large_image && (
                          <img 
                            src={discordPresence.activity.assets.large_image.startsWith('mp:') 
                              ? `https://media.discordapp.net/${discordPresence.activity.assets.large_image.slice(3)}`
                              : `https://cdn.discordapp.com/app-assets/${discordPresence.activity.application_id}/${discordPresence.activity.assets.large_image}.png`
                            }
                            alt="Activity"
                            className="w-12 h-12 rounded-lg"
                          />
                        )}
                        <div>
                          <p className="font-medium">{discordPresence.activity.name}</p>
                          {discordPresence.activity.details && (
                            <p className="text-sm text-muted-foreground">{discordPresence.activity.details}</p>
                          )}
                          {discordPresence.activity.state && (
                            <p className="text-xs text-muted-foreground">{discordPresence.activity.state}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : activity ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {activity.type === 'coding' && <Code className="w-4 h-4 text-blue-500" />}
                        {activity.type === 'gaming' && <Gamepad2 className="w-4 h-4 text-purple-500" />}
                        {activity.type === 'listening' && <Music className="w-4 h-4 text-green-500" />}
                        {activity.type === 'idle' && <Monitor className="w-4 h-4 text-gray-500" />}
                        <span className="font-medium capitalize">{activity.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                      {activity.application && (
                        <p className="text-xs text-muted-foreground">in {activity.application}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No current activity</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Messages</h2>
                  <p className="text-muted-foreground">Manage contact form submissions</p>
                </div>
                
                <button
                  onClick={() => fetchMessages()}
                  className="flex items-center space-x-2 px-4 py-2 glass-card hover:bg-muted/50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">When people contact you, their messages will appear here.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`glass-card p-6 space-y-4 ${!message.read ? 'ring-2 ring-orange-500/50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{message.subject}</h3>
                            {!message.read && (
                              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            From: <span className="font-medium">{message.name}</span> 
                            {' • '}
                            <a 
                              href={`mailto:${message.email}`} 
                              className="text-primary hover:underline"
                            >
                              {message.email}
                            </a>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString()}
                            {message.ip_address && ` • IP: ${message.ip_address}`}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {!message.read && (
                            <button
                              onClick={() => markAsRead(message.id)}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteMessage(message.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-muted-foreground">Configure your dashboard and public profile</p>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Activity Display</h3>
                <div className="space-y-4">
                  {Object.entries(activitySettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                        <p className="text-sm text-muted-foreground">
                          {key === 'showDiscord' && 'Show Discord presence and activity'}
                          {key === 'showSpotify' && 'Show currently playing Spotify track'}
                          {key === 'showCoding' && 'Show coding activity and commits'}
                          {key === 'showGaming' && 'Show gaming activity'}
                          {key === 'showGeneral' && 'Show general status updates'}
                        </p>
                      </div>
                      <button
                        onClick={() => setActivitySettings(prev => ({ ...prev, [key]: !value }))}
                        className="p-1"
                      >
                        {value ? (
                          <ToggleRight className="w-8 h-8 text-primary" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {repoSettings.allRepos.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Repository Visibility</h3>
                  <div className="space-y-3">
                    {repoSettings.allRepos.map((repo) => (
                      <div key={repo.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{repo.name}</p>
                            {repoSettings.featuredRepos.includes(repo.name) && (
                              <Star className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{repo.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">{repo.language}</span>
                            <span className="text-xs text-muted-foreground">{repo.stargazers_count} stars</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleRepoFeatured(repo.name)}
                            className={`p-2 rounded-lg transition-colors ${
                              repoSettings.featuredRepos.includes(repo.name)
                                ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                            title="Toggle featured"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleRepoVisibility(repo.name)}
                            className={`p-2 rounded-lg transition-colors ${
                              repoSettings.hiddenRepos.includes(repo.name)
                                ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900'
                                : 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900'
                            }`}
                            title={repoSettings.hiddenRepos.includes(repo.name) ? 'Show repository' : 'Hide repository'}
                          >
                            {repoSettings.hiddenRepos.includes(repo.name) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}