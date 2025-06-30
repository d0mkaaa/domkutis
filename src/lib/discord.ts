interface DiscordActivity {
  name: string;
  details?: string;
  state?: string;
  type: number;
  timestamps?: {
    start?: number;
    end?: number;
  };
}

export async function getDiscordActivity(): Promise<DiscordActivity | null> {
  try {
    const DISCORD_USER_ID = "578600798842519563";
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.data.activities) {
        
        const activity = data.data.activities.find(
          (act: any) => act.name !== 'Spotify' && act.type !== 2
        );
        
        if (activity) {
          return {
            name: activity.name,
            details: activity.details,
            state: activity.state,
            type: activity.type,
            timestamps: activity.timestamps
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch Discord activity:', error);
    return null;
  }
}