'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Music, 
  Code, 
  Gamepad2, 
  Coffee, 
  ChevronDown,
  MonitorSpeaker,
  Activity,
  Eye,
  Headphones
} from 'lucide-react'

type ActivityType = 'coding' | 'gaming' | 'communication' | 'other';

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
  customStatus: {
    text?: string;
    emoji?: {
      name: string;
      id?: string;
      animated?: boolean;
    };
  }
  lastSeen: string
  source?: string
}

interface ActivityStatus {
  type: ActivityType;
  details: string;
  application?: string;
  timestamp: number;
  discordPresence?: DiscordPresence;
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
  fetchedAt: number
}

export function StatusWidget() {
  const [activity, setActivity] = useState<ActivityStatus | null>(null)
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [discordActivity, setDiscordActivity] = useState<DiscordActivity | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [liveProgress, setLiveProgress] = useState(0)
  const [activitySettings, setActivitySettings] = useState({
    show_discord: true,
    show_spotify: true,
    show_coding: true,
    show_gaming: true,
    show_general: true
  })

  useEffect(() => {
    const fetchActivitySettings = async () => {
      try {
        const response = await fetch('/api/settings/activity')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setActivitySettings(data.data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch activity settings:', error)
      }
    }

    fetchActivitySettings()
  }, [])

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();

        if (data.success && data.activity) {
          setActivity({
            type: data.activity.type,
            details: data.activity.details || 'probably debugging something right now tbh',
            application: data.activity.application,
            timestamp: data.activity.timestamp,
          });

          if (data.discordActivity) {
            setDiscordActivity(data.discordActivity);
          }
        } else {
          
          setActivity({
            type: 'other',
            details: 'probably debugging something right now tbh',
            timestamp: Date.now(),
          });
          setDiscordActivity(null);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
        setActivity({
          type: 'other',
          details: 'probably debugging something right now tbh',
          timestamp: Date.now(),
        });
        setDiscordActivity(null);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activitySettings.show_spotify) return

    const fetchSpotify = async () => {
      try {
        const response = await fetch('/api/spotify/current-track', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.isPlaying && data.name) {
            setCurrentTrack({
              ...data,
              fetchedAt: Date.now()
            });
            setLiveProgress(data.progress);
          } else {
            setCurrentTrack(null);
            setLiveProgress(0);
          }
        } else {
          if (response.status !== 401) {
            console.error('Error fetching Spotify data:', response.status);
          }
          setCurrentTrack(null);
          setLiveProgress(0);
        }
      } catch (error) {
        console.error('Error fetching Spotify data:', error);
        setCurrentTrack(null);
        setLiveProgress(0);
      }
    };

    fetchSpotify();
    const interval = setInterval(fetchSpotify, 5000);
    return () => clearInterval(interval);
  }, [activitySettings.show_spotify]);

  useEffect(() => {
    if (!currentTrack || !currentTrack.isPlaying) return;

    const interval = setInterval(() => {
      setLiveProgress((prev) => {
        const newProgress = prev + 1000;
        return Math.min(newProgress, currentTrack.duration);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTrack?.isPlaying, currentTrack?.duration]);

  useEffect(() => {
    if (currentTrack) {
      setLiveProgress(currentTrack.progress);
    }
  }, [currentTrack?.name]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'coding':
        return <Code size={20} className="text-blue-400" />;
      case 'gaming':
        return <Gamepad2 size={20} className="text-green-400" />;
      case 'communication':
        return <MonitorSpeaker size={20} className="text-purple-400" />;
      case 'other':
        return <Coffee size={20} className="text-orange-400" />;
      default:
        return <Activity size={20} className="text-gray-400" />;
    }
  };

  const getDiscordActivityIcon = (discordActivity: DiscordActivity) => {
    switch (discordActivity.type) {
      case 0: 
        return <Gamepad2 className="text-white" size={20} />;
      case 1: 
        return <MonitorSpeaker className="text-white" size={20} />;
      case 2: 
        return <Headphones className="text-white" size={20} />;
      case 3: 
        return <Eye className="text-white" size={20} />;
      default:
        return <Activity className="text-white" size={20} />;
    }
  };

  const getDiscordImageUrl = (imageKey: string) => {
    if (imageKey.startsWith('mp:')) {
      return `https://media.discordapp.net/${imageKey.slice(3)}`;
    }
    return `https://cdn.discordapp.com/app-assets/${imageKey}`;
  };

  const getActivitySubtitle = () => {
    if (!activity) return 'Available for work'
    
    const minutesAgo = Math.floor((Date.now() - activity.timestamp) / 60000)
    const timeText = minutesAgo < 1 ? 'Just now' : 
                     minutesAgo === 1 ? '1 minute ago' : 
                     `${minutesAgo} minutes ago`

    if (activity.application) {
      return `${activity.application} • ${timeText}`
    }
    
    return timeText
  }

  if (!activity) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <motion.div
        className="glass-card p-4 rounded-xl cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getActivityIcon(activity.type as ActivityType)}
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {activity.type === 'coding' ? 'Coding' : 
                 activity.type === 'gaming' ? 'Gaming' : 'Active'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {getActivitySubtitle()}
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="glass-card mt-2 p-4 rounded-xl space-y-4">
              {discordActivity && activitySettings.show_discord && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-xs font-medium text-foreground">
                      Discord Activity
                    </span>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {discordActivity.assets?.large_image ? (
                        <motion.div
                          className="w-16 h-16 rounded-lg overflow-hidden shadow-lg"
                          whileHover={{ scale: 1.05 }}
                        >
                          <img
                            src={getDiscordImageUrl(discordActivity.assets.large_image)}
                            alt={discordActivity.assets.large_text || discordActivity.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                            {getDiscordActivityIcon(discordActivity)}
                          </div>
                        </motion.div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                          {getDiscordActivityIcon(discordActivity)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {discordActivity.name}
                      </h4>
                      
                      {discordActivity.details && (
                        <p className="text-xs text-foreground truncate font-medium">
                          {discordActivity.details}
                        </p>
                      )}
                      
                      {discordActivity.state && discordActivity.state !== discordActivity.details && (
                        <p className="text-xs text-muted-foreground truncate">
                          {discordActivity.state}
                        </p>
                      )}
                      
                      {discordActivity.timestamps?.start && (
                        <p className="text-xs text-muted-foreground">
                          Started {new Date(discordActivity.timestamps.start).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!discordActivity && activitySettings.show_general && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    {getActivityIcon(activity.type as ActivityType)}
                    <span className="text-xs font-medium text-foreground">
                      Current Activity
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-foreground font-medium">
                      {activity.details}
                    </p>
                    
                    {activity.application && (
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <p className="text-xs text-muted-foreground">
                          Using {activity.application}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Last active {Math.floor((Date.now() - activity.timestamp) / 60000)} minutes ago
                    </p>
                  </div>
                </div>
              )}

              {currentTrack && activitySettings.show_spotify && (
                <div className={discordActivity ? "border-t border-border pt-4" : ""}>
                  <div className="flex items-center space-x-2 mb-3">
                    <Music size={14} className="text-green-400" />
                    <span className="text-xs font-medium text-foreground">
                      Now Playing on Spotify
                    </span>
                    {currentTrack.isPlaying && (
                      <motion.div
                        className="w-2 h-2 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    {currentTrack.images.small && (
                      <motion.a
                        href={currentTrack.album.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 rounded-lg overflow-hidden hover:scale-105 transition-transform shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img
                          src={currentTrack.images.small}
                          alt={currentTrack.album.name}
                          className="w-16 h-16 object-cover"
                        />
                      </motion.a>
                    )}
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <a
                        href={currentTrack.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:underline truncate block"
                      >
                        {currentTrack.name}
                      </a>
                      
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        {currentTrack.artists.map((artist, index) => (
                          <span key={artist.name}>
                            <a
                              href={artist.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {artist.name}
                            </a>
                            {index < currentTrack.artists.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                      
                      <div className="relative w-full h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-green-400"
                          initial={{ width: `${(liveProgress / currentTrack.duration) * 100}%` }}
                          animate={{ width: `${(liveProgress / currentTrack.duration) * 100}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}