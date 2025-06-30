# 🔥 my portfolio

this is a sick developer portfolio that actually stands out from the boring overused bio pages.

## 🏗️ the good stuff

### 🌟 **Hero Section**
interactive rainbow name that reacts to mouse movement.

### 👨‍💻 **About Section** 
skills, experience, and personality.

### 📁 **Projects Showcase**
real GitHub repositories with live stats, language badges, and proper descriptions. No fake "coming soon" cards.

### 📬 **Contact Form**
actually functional contact form that saves to PostgreSQL. messages show up in my admin dashboard.

### 🎛️ **Admin Dashboard**
Private dashboard shows:
- Real-time Discord activity and Spotify status
- GitHub statistics and recent commits
- Contact form messages with read/unread status
- Repository visibility controls

## 🚀 quick setup

### What You Need
- Node.js 22+ (don't use ancient versions)
- Docker (if you want the full experience)
- A Discord app (for OAuth)
- Spotify app (for music integration)

### Get It Running

1. **Clone this beauty:**
   ```bash
   git clone https://github.com/d0mkaaa/domkutis.git
   cd domkutis
   ```

2. **Install the goods:**
   ```bash
   npm install
   ```

3. **Set up your secrets** (create `.env` file):
   ```env
   # Your Discord stuff
   NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   NEXT_PUBLIC_DISCORD_USER_ID=your_discord_user_id
   
   # Spotify integration
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   
   # Your GitHub username
   NEXT_PUBLIC_GITHUB_USERNAME=your_github_username
   ```

4. **Fire it up:**
   ```bash
   npm run dev
   ```

5. **Visit** [http://localhost:3000](http://localhost:3000) and prepare to be amazed.

## 🔧 The Full Setup (If You Want Everything)

### Discord OAuth Setup
Because real authentication matters:

1. **Create Discord App**: Head to [Discord Developer Portal](https://discord.com/developers/applications)
2. **OAuth2 Setup**: Add redirect URI `http://localhost:3000/dashboard` (+ your domain for production)
3. **Get Your IDs**: 
   - Client ID & Secret from your app
   - Your User ID (enable Developer Mode → right-click your profile → Copy User ID)

### Spotify Integration
For the music flexing:

1. **Spotify App**: Create one at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. **Redirect URI**: Add `http://localhost:3000/dashboard`
3. **Grab Keys**: Client ID and Client Secret

### Complete Environment Variables

```env
# Discord OAuth & User Info
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret  
NEXT_PUBLIC_DISCORD_USER_ID=your_discord_user_id
NEXT_PUBLIC_DISCORD_USERNAME=your_username
NEXT_PUBLIC_DISCORD_DISPLAY_NAME=Your Display Name

# Spotify Music Integration
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/dashboard

# GitHub Projects
NEXT_PUBLIC_GITHUB_USERNAME=your_github_username

# URLs
NEXT_PUBLIC_PROD_URL=https://your-domain.com
NEXT_PUBLIC_DEV_URL=http://localhost:3000

# Database (PostgreSQL)
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:password@localhost:5432/domkutis_portfolio
```

### 🐳 Docker Setup (Recommended)

Want the full stack experience? Use Docker:

```bash
# Build and run everything
docker-compose up --build

# Your site: http://localhost:3000
# Database: localhost:5432
```

## 🚀 deploy this beauty!!!

### Production Build
```bash
npm run build
npm start
```

### Docker Production
```bash
# For production deployment
docker-compose up -d
```

## 🎨 Make It Yours

### 🌈 **Color Scheme**
Customize the palette in `src/app/globals.css`:
```css
@theme {
  --color-primary: #your-brand-color;
  --color-accent: #your-accent-color;
}
```

### 🎯 **Component Structure**
```
src/components/
├── Hero.tsx          # Rainbow name animation
├── About.tsx         # Skills and personality
├── Projects.tsx      # GitHub project showcase  
├── Contact.tsx       # Contact form with database
├── Navigation.tsx    # Floating navbar magic
├── StatusWidget.tsx  # Discord/Spotify integration
└── AnimatedBackground.tsx  # Particle system
```

### 🔐 **Security Notes**
- Dashboard is protected by Discord OAuth
- Only your Discord User ID can access admin features
- Environment variables keep secrets safe
- Database queries are sanitized

## 🤝 Want to Contribute?

Found a bug? Have a sick feature idea? PRs are welcome!

## 📬 Hit Me Up

- **GitHub**: [@d0mkaaa](https://github.com/d0mkaaa)
- **Discord**: @d0mkaaa
- **Portfolio**: [domkutis.com](https://domkutis.com)

---

**Built with** ❤️
*Powered by Next.js 15, TypeScript, and hopes*

> *"Why use a template when you can build something that doesn't look like everyone else's?"*