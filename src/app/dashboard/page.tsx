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
  Star
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
  timestamp: string;
  read: boolean;
  name: string;
  email: string;
  subject: string;
  message: string;
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
  const [messages, setMessages] = useState<any[]>([])
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

  const fetchMessages = async () => {
    try {
      const discordToken = localStorage.getItem('discord_token')
      const response = await fetch('/api/messages', {
        headers: {
          'discord-token': discordToken || ''
        }
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      const discordToken = localStorage.getItem('discord_token')
      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: 'PATCH',
        headers: {
          'discord-token': discordToken || ''
        }
      })
      if (response.ok) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error)
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
      fetchMessages()
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card-strong p-8 rounded-2xl text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 glass-card rounded-full flex items-center justify-center"
          >
            <User className="text-primary" size={32} />
          </motion.div>
          
          <h1 className="text-2xl font-bold gradient-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mb-6">
            Restricted access - d0mkaaa only
          </p>
          
          <motion.button
            onClick={loginWithDiscord}
            disabled={isLoading}
            className="w-full btn-primary text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle size={20} />
            <span>{isLoading ? 'Connecting...' : 'Login with Discord'}</span>
          </motion.button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Only authorized users can access this dashboard
          </p>
        </motion.div>
      </div>
    )
  }

  if (user.id !== AUTHORIZED_USER_ID) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card-strong p-8 rounded-2xl text-center"
        >
          <h1 className="text-2xl font-bold text-red-400 mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            This dashboard is restricted to authorized users only.
          </p>
          <motion.button
            onClick={logout}
            className="btn-glass text-foreground py-2 px-4 rounded-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Logout
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-nav-enhanced rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold">
                  {user.global_name?.[0] || user.username[0]}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">
                  Welcome back, {user.global_name || user.username}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Dashboard Control Center
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => setIsPublicVisible(!isPublicVisible)}
                className="glass-card p-3 rounded-lg hover-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={isPublicVisible ? "Hide public status" : "Show public status"}
              >
                {isPublicVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </motion.button>
              
              <motion.button
                onClick={logout}
                className="glass-card p-3 rounded-lg hover-glow text-red-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card-strong p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Current Activity</h3>
                <Activity className="text-primary" size={20} />
              </div>
              
              {activity && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'coding' ? 'bg-green-400' :
                      activity.type === 'gaming' ? 'bg-purple-400' :
                      activity.type === 'listening' ? 'bg-blue-400' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm font-medium capitalize">
                      {activity.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {activity.details}
                  </p>
                  
                  {activity.application && (
                    <p className="text-xs text-muted-foreground">
                      in {activity.application}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Status visible to public</span>
                    <motion.div
                      className={`w-2 h-2 rounded-full ${isPublicVisible ? 'bg-green-400' : 'bg-gray-400'}`}
                      animate={{ scale: isPublicVisible ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 2, repeat: isPublicVisible ? Infinity : 0 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-strong p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">System Status</h3>
                <Monitor className="text-primary" size={20} />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Portfolio Status</span>
                  <span className="text-green-400">Online</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discord Status</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spotify Status</span>
                  <span className={spotifyConnected ? 'text-green-400' : 'text-gray-400'}>
                    {spotifyConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GitHub API</span>
                  <span className="text-green-400">Active</span>
                </div>
                
                <div className="pt-3 border-t border-border">
                  <motion.button
                    onClick={() => {
                      fetchDiscordActivity()
                      fetchGitHubData()
                      fetchMessages()
                    }}
                    className="w-full btn-glass py-2 rounded-lg text-sm hover-glow flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RefreshCw size={14} />
                    <span>Refresh All Data</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card-strong p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Discord Activity</h3>
                <div className="flex items-center space-x-2">
                  {discordPresence && (
                    <div className={`w-2 h-2 rounded-full ${
                      discordPresence.status === 'online' ? 'bg-green-400' :
                      discordPresence.status === 'idle' ? 'bg-yellow-400' :
                      discordPresence.status === 'dnd' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`} />
                  )}
                  <Activity className={`${
                    discordPresence?.status === 'online' ? 'text-green-400' :
                    discordPresence?.status === 'idle' ? 'text-yellow-400' :
                    discordPresence?.status === 'dnd' ? 'text-red-400' :
                    'text-gray-400'
                  }`} size={20} />
                </div>
              </div>

              {discordPresence?.activity ? (
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {discordPresence.activity.assets?.large_image ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className="relative w-16 h-16"
                        >
                          <img
                            src={
                              discordPresence.activity.assets.large_image.startsWith('mp:')
                                ? `https://media.discordapp.net/${discordPresence.activity.assets.large_image.slice(3)}`
                                : `https://cdn.discordapp.com/app-assets/${discordPresence.activity.assets.large_image}`
                            }
                            alt={discordPresence.activity.assets.large_text || discordPresence.activity.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                            {discordPresence.activity.type === 0 ? (
                              <Gamepad2 className="text-white" size={20} />
                            ) : discordPresence.activity.type === 3 ? (
                              <Eye className="text-white" size={20} />
                            ) : (
                              <Activity className="text-white" size={20} />
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                          {discordPresence.activity.type === 0 ? (
                            <Gamepad2 className="text-white" size={20} />
                          ) : discordPresence.activity.type === 3 ? (
                            <Eye className="text-white" size={20} />
                          ) : (
                            <Activity className="text-white" size={20} />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {discordPresence.activity.name}
                      </p>
                      {discordPresence.activity.details && (
                        <p className="text-xs text-foreground truncate font-medium">
                          {discordPresence.activity.details}
                        </p>
                      )}
                      {discordPresence.activity.state && discordPresence.activity.state !== discordPresence.activity.details && (
                        <p className="text-xs text-muted-foreground truncate">
                          {discordPresence.activity.state}
                        </p>
                      )}
                      {discordPresence.activity.timestamps?.start && (
                        <p className="text-xs text-muted-foreground">
                          Started {new Date(discordPresence.activity.timestamps.start).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Activity className="mx-auto text-muted-foreground mb-2" size={24} />
                  <p className="text-sm text-muted-foreground">
                    No Discord activity detected
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Last updated: {discordPresence?.lastSeen ? new Date(discordPresence.lastSeen).toLocaleTimeString() : 'Never'}
                </span>
                <motion.button
                  onClick={fetchDiscordActivity}
                  className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={12} />
                  <span>Refresh</span>
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card-strong p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Spotify</h3>
                <Music className="text-green-400" size={20} />
              </div>
              
              {!spotifyConnected ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect Spotify to show what you're listening to
                  </p>
                  <motion.button
                    onClick={connectSpotify}
                    className="btn-primary text-white py-2 px-4 rounded-lg flex items-center space-x-2 mx-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Music size={16} />
                    <span>Connect Spotify</span>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTrack ? (
                    <>
                      <div className="flex items-start space-x-3">
                        {currentTrack.images.medium ? (
                          <motion.a
                            href={currentTrack.album.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <img
                              src={currentTrack.images.medium}
                              alt={`${currentTrack.album.name} cover`}
                              className="w-16 h-16 object-cover"
                            />
                          </motion.a>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                            <Music className="text-white" size={24} />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <motion.a
                            href={currentTrack.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block font-semibold text-sm text-foreground hover:text-primary transition-colors truncate group"
                            whileHover={{ scale: 1.02 }}
                          >
                            {currentTrack.name}
                            {currentTrack.explicit && (
                              <span className="ml-2 text-xs bg-muted-foreground/20 px-1.5 py-0.5 rounded">E</span>
                            )}
                            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">🎵</span>
                          </motion.a>
                          
                          <div className="text-xs text-muted-foreground mt-1">
                            <span>by </span>
                            {currentTrack.artists.map((artist, index) => (
                              <span key={artist.name}>
                                <motion.a
                                  href={artist.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary transition-colors hover:underline"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {artist.name}
                                </motion.a>
                                {index < currentTrack.artists.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                          
                          <motion.a
                            href={currentTrack.album.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-muted-foreground hover:text-primary transition-colors truncate mt-1"
                            whileHover={{ scale: 1.02 }}
                          >
                            {currentTrack.album.name}
                          </motion.a>
                          
                          <div className="flex items-center space-x-3 mt-2">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-muted-foreground">Popularity:</span>
                              <div className="flex space-x-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 h-2 rounded-sm ${
                                      i < Math.floor(currentTrack.popularity / 20)
                                        ? 'bg-green-400'
                                        : 'bg-muted-foreground/20'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {currentTrack.preview_url && (
                              <motion.a
                                href={currentTrack.preview_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                                whileHover={{ scale: 1.05 }}
                              >
                                🎧 Preview
                              </motion.a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{Math.floor(liveProgress / 60000)}:{String(Math.floor((liveProgress % 60000) / 1000)).padStart(2, '0')}</span>
                          <div className="flex items-center space-x-2">
                            {currentTrack.isPlaying && (
                              <motion.div
                                className="w-2 h-2 bg-green-400 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            )}
                            <span className="text-xs font-medium">
                              {currentTrack.isPlaying ? 'Playing' : 'Paused'}
                            </span>
                          </div>
                          <span>{Math.floor(currentTrack.duration / 60000)}:{String(Math.floor((currentTrack.duration % 60000) / 1000)).padStart(2, '0')}</span>
                        </div>
                        <div className="bg-muted-foreground/20 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full shadow-sm"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((liveProgress / currentTrack.duration) * 100, 100)}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Connected to Spotify
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Not currently playing
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400 font-medium">Connected</span>
                    </div>
                    <motion.button
                      onClick={disconnectSpotify}
                      className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Disconnect
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card-strong p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-foreground/10 rounded-lg">
                    <Github className="text-foreground" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">GitHub Activity</h3>
                    <p className="text-xs text-muted-foreground">
                      Live data from GitHub API
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={fetchGitHubData}
                  className="flex items-center space-x-2 text-xs text-primary hover:text-primary/80 transition-colors px-3 py-2 glass-card rounded-lg hover-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </motion.button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 glass-card rounded-lg">
                  <div className="text-lg font-bold text-foreground">{githubData?.todaysCommits || 0}</div>
                  <div className="text-xs text-muted-foreground">Today's Commits</div>
                </div>
                <div className="text-center p-3 glass-card rounded-lg">
                  <div className="text-lg font-bold text-foreground">{githubData?.activeRepos || 0}</div>
                  <div className="text-xs text-muted-foreground">Active Repos</div>
                </div>
                <div className="text-center p-3 glass-card rounded-lg">
                  <div className="text-lg font-bold text-foreground">{githubData?.followers || 0}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center p-3 glass-card rounded-lg">
                  <div className="text-lg font-bold text-foreground">{githubData?.totalStars || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Stars</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Recent Activity</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {githubData?.recentActivity?.length ? (
                    githubData.recentActivity.map((event: any, index: number) => {
                      const getEventIcon = () => {
                        switch (event.type) {
                          case 'PushEvent':
                            return '📝'
                          case 'CreateEvent':
                            return '🚀'
                          case 'WatchEvent':
                            return '⭐'
                          case 'ForkEvent':
                            return '🍴'
                          case 'IssuesEvent':
                            return '🐛'
                          case 'PullRequestEvent':
                            return '🔄'
                          default:
                            return '📊'
                        }
                      }

                      const getEventDescription = () => {
                        switch (event.type) {
                          case 'PushEvent':
                            const commitCount = event.payload?.commits?.length || 0
                            return `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${event.repo.name}`
                          case 'CreateEvent':
                            return `Created ${event.payload.ref_type} in ${event.repo.name}`
                          case 'WatchEvent':
                            return `Starred ${event.repo.name}`
                          case 'ForkEvent':
                            return `Forked ${event.repo.name}`
                          case 'IssuesEvent':
                            return `${event.payload.action} issue in ${event.repo.name}`
                          case 'PullRequestEvent':
                            return `${event.payload.action} pull request in ${event.repo.name}`
                          default:
                            return `Activity in ${event.repo.name}`
                        }
                      }

                      const timeAgo = () => {
                        const date = new Date(event.created_at)
                        const now = new Date()
                        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
                        const diffInDays = Math.floor(diffInHours / 24)
                        
                        if (diffInDays > 0) {
                          return `${diffInDays}d ago`
                        } else if (diffInHours > 0) {
                          return `${diffInHours}h ago`
                        } else {
                          const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
                          return diffInMinutes > 0 ? `${diffInMinutes}m ago` : 'Just now'
                        }
                      }

                      return (
                        <motion.div
                          key={`${event.id}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start space-x-3 p-3 glass-card rounded-lg hover:bg-accent/5 transition-colors"
                        >
                          <span className="text-lg flex-shrink-0">{getEventIcon()}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium truncate">
                              {getEventDescription()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {timeAgo()}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Github className="mx-auto text-muted-foreground mb-2" size={24} />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              <motion.a
                href={`https://github.com/${user?.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block btn-glass text-center py-3 rounded-lg text-sm hover-glow mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Full Profile
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card-strong p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-foreground/10 rounded-lg">
                    <Settings className="text-foreground" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Repository Management</h3>
                    <p className="text-xs text-muted-foreground">
                      Control which repos appear on your portfolio
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Show/Hide Repositories</span>
                  <span className="text-xs text-muted-foreground">
                    {repoSettings.allRepos.length - repoSettings.hiddenRepos.length} of {repoSettings.allRepos.length} visible
                  </span>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {repoSettings.allRepos.map((repo: Repository) => {
                    const isHidden = repoSettings.hiddenRepos.includes(repo.name);
                    const isFeatured = repoSettings.featuredRepos.includes(repo.name);
                    
                    return (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 glass-card rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              onClick={() => toggleRepoVisibility(repo.name)}
                              className={`p-1 rounded transition-colors ${
                                isHidden ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                            </motion.button>
                            
                            <motion.button
                              onClick={() => toggleRepoFeatured(repo.name)}
                              className={`p-1 rounded transition-colors ${
                                isFeatured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-gray-300'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title={isFeatured ? 'Remove from featured' : 'Add to featured'}
                            >
                              <Star size={16} className={isFeatured ? 'fill-current' : ''} />
                            </motion.button>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium truncate ${
                                isHidden ? 'text-muted-foreground line-through' : 'text-foreground'
                              }`}>
                                {repo.name}
                              </span>
                              {isFeatured && (
                                <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {repo.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Star size={12} />
                            <span>{repo.stargazers_count}</span>
                          </div>
                          {repo.language && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ 
                                backgroundColor: (() => {
                                  const colors: Record<string, string> = {
                                    'JavaScript': '#f1e05a',
                                    'TypeScript': '#3178c6',
                                    'Python': '#3572A5',
                                    'HTML': '#e34c26',
                                    'CSS': '#1572B6',
                                    'React': '#61dafb',
                                  };
                                  return colors[repo.language] || '#6b7280';
                                })()
                              }}
                              title={repo.language}
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {repoSettings.allRepos.length === 0 && (
                  <div className="text-center py-8">
                    <Github className="mx-auto text-muted-foreground mb-2" size={24} />
                    <p className="text-sm text-muted-foreground">No repositories loaded</p>
                    <motion.button
                      onClick={fetchGitHubData}
                      className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Load repositories
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card-strong p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Mail className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Messages</h3>
                    <p className="text-xs text-muted-foreground">
                      {messages.length} total • {unreadCount} unread
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <motion.span 
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </div>
                <motion.button
                  onClick={fetchMessages}
                  className="flex items-center space-x-2 text-xs text-primary hover:text-primary/80 transition-colors px-3 py-2 glass-card rounded-lg hover-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </motion.button>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 glass-card rounded-full flex items-center justify-center">
                      <Mail className="text-muted-foreground" size={24} />
                    </div>
                    <p className="text-sm text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Messages from your contact form will appear here</p>
                  </div>
                ) : (
                  messages.map((message: Message, index: number) => {
                    const messageDate = new Date(message.timestamp);
                    const now = new Date();
                    const diffInHours = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60));
                    const diffInDays = Math.floor(diffInHours / 24);
                    
                    let timeAgo = '';
                    if (diffInDays > 0) {
                      timeAgo = `${diffInDays}d ago`;
                    } else if (diffInHours > 0) {
                      timeAgo = `${diffInHours}h ago`;
                    } else {
                      const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
                      timeAgo = diffInMinutes > 0 ? `${diffInMinutes}m ago` : 'Just now';
                    }

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] group ${
                          message.read 
                            ? 'bg-background/50 border-border hover:border-border-light' 
                            : 'bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-blue-200/50 shadow-sm hover:shadow-md'
                        }`}
                        onClick={() => !message.read && markMessageAsRead(message.id)}
                        whileHover={{ y: -2 }}
                      >
                        {!message.read && (
                          <div className="absolute top-2 right-2">
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                        )}

                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {message.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                  {message.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {message.email}
                                </p>
                              </div>
                              {!message.read && (
                                <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                  <Bell size={10} />
                                  <span>New</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="pl-10">
                              <p className="text-sm font-medium text-foreground mb-1">
                                📧 {message.subject}
                              </p>
                              
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {message.message}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-1">
                            <div className="text-xs text-muted-foreground font-medium">
                              {timeAgo}
                            </div>
                            <div className="text-xs text-muted-foreground/70">
                              {messageDate.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                              })}
                            </div>
                          </div>
                        </div>

                        {!message.read && (
                          <div className="absolute bottom-2 right-2 text-xs text-blue-600">
                            Click to mark as read
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}