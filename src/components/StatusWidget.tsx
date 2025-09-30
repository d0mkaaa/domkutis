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
  category?: string
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

interface DiscordSpotify {
  name: string
  details?: string
  state?: string
  timestamps?: {
    start?: number
    end?: number
  }
  assets?: {
    large_image?: string
    large_text?: string
  }
}

export function StatusWidget() {
  const [activity, setActivity] = useState<ActivityStatus | null>(null)
  const [discordSpotify, setDiscordSpotify] = useState<DiscordSpotify | null>(null)
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
        const discordResponse = await fetch('/api/discord/activity');
        const discordData = await discordResponse.json();

        if (discordData.activity) {
          setDiscordActivity(discordData.activity);
        } else {
          setDiscordActivity(null);
        }

        if (discordData.spotify) {
          setDiscordSpotify(discordData.spotify);
        } else {
          setDiscordSpotify(null);
        }

        if (!discordData.activity) {
          const response = await fetch('/api/status');
          const data = await response.json();

          if (data.success && data.activity) {
            setActivity({
              type: data.activity.type,
              details: data.activity.details || 'probably debugging something right now tbh',
              application: data.activity.application,
              timestamp: data.activity.timestamp,
            });
          } else {
            setActivity({
              type: 'other',
              details: 'probably debugging something right now tbh',
              timestamp: Date.now(),
            });
          }
        } else {
          setActivity(null);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
        setActivity({
          type: 'other',
          details: 'probably debugging something right now tbh',
          timestamp: Date.now(),
        });
        setDiscordActivity(null);
        setDiscordSpotify(null);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!discordSpotify || !discordSpotify.timestamps) {
      setLiveProgress(0);
      return;
    }

    const updateProgress = () => {
      if (discordSpotify.timestamps?.start && discordSpotify.timestamps?.end) {
        const now = Date.now();
        const total = discordSpotify.timestamps.end - discordSpotify.timestamps.start;
        const elapsed = now - discordSpotify.timestamps.start;
        setLiveProgress(Math.max(0, Math.min(elapsed, total)));
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [discordSpotify]);

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
    if (imageKey.startsWith('spotify:')) {
      return `https://i.scdn.co/image/${imageKey.slice(8)}`;
    }
    return `https://cdn.discordapp.com/app-assets/${imageKey}`;
  };

  const getActivitySubtitle = () => {
    if (discordActivity) {
      if (discordActivity.timestamps?.start) {
        const minutesAgo = Math.floor((Date.now() - discordActivity.timestamps.start) / 60000)
        const timeText = minutesAgo < 1 ? 'Just started' :
                         minutesAgo === 1 ? '1 minute ago' :
                         `${minutesAgo} minutes ago`
        return timeText
      }
      return 'Currently active'
    }

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

  const getMainActivityTitle = () => {
    if (discordActivity) {
      switch (discordActivity.category) {
        case 'coding': return 'Coding'
        case 'gaming': return 'Gaming'
        case 'communication': return 'In Call'
        default: return 'Active'
      }
    }

    if (activity) {
      switch (activity.type) {
        case 'coding': return 'Coding'
        case 'gaming': return 'Gaming'
        case 'communication': return 'In Call'
        default: return 'Active'
      }
    }

    return 'Available'
  }

  const getMainActivityIcon = () => {
    if (discordActivity) {
      switch (discordActivity.category) {
        case 'coding': return <Code size={20} className="text-blue-400" />
        case 'gaming': return <Gamepad2 size={20} className="text-green-400" />
        case 'communication': return <MonitorSpeaker size={20} className="text-purple-400" />
        default: return <Activity size={20} className="text-gray-400" />
      }
    }

    if (activity) {
      return getActivityIcon(activity.type as ActivityType)
    }

    return <Coffee size={20} className="text-orange-400" />
  }

  if (!activity && !discordActivity) return null;

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
            {getMainActivityIcon()}
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {getMainActivityTitle()}
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

              {!discordActivity && activitySettings.show_general && activity && (
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

              {discordSpotify && activitySettings.show_spotify && (
                <div className={discordActivity ? "border-t border-border pt-4" : ""}>
                  <div className="flex items-center space-x-2 mb-3">
                    <Music size={14} className="text-green-400" />
                    <span className="text-xs font-medium text-foreground">
                      Listening on Spotify
                    </span>
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    {discordSpotify.assets?.large_image && (
                      <motion.div
                        className="flex-shrink-0 rounded-lg overflow-hidden shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img
                          src={getDiscordImageUrl(discordSpotify.assets.large_image)}
                          alt={discordSpotify.assets.large_text || 'Album artwork'}
                          className="w-16 h-16 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </motion.div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-sm font-medium text-foreground truncate">
                        {discordSpotify.details || 'Unknown Track'}
                      </div>

                      <div className="text-xs text-muted-foreground truncate">
                        by {discordSpotify.state || 'Unknown Artist'}
                      </div>

                      {discordSpotify.assets?.large_text && (
                        <div className="text-xs text-muted-foreground truncate">
                          on {discordSpotify.assets.large_text}
                        </div>
                      )}

                      {discordSpotify.timestamps?.start && discordSpotify.timestamps?.end && (
                        <div className="relative w-full h-1 bg-muted rounded-full overflow-hidden mt-2">
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-green-400"
                            initial={{ width: `${(liveProgress / (discordSpotify.timestamps.end - discordSpotify.timestamps.start)) * 100}%` }}
                            animate={{ width: `${(liveProgress / (discordSpotify.timestamps.end - discordSpotify.timestamps.start)) * 100}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      )}
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