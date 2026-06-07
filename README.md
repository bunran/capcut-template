# TikTok Growth Engine 🎯

AI-powered TikTok content system. Generate ideas, full scripts, a 4-week posting calendar, and track what performs — all in one app.

## Features

- **💡 Ideas** — AI generates video ideas across your chosen niches, ranked by viral potential
- **📝 Scripts** — Full word-for-word scripts with scenes, hooks, CTAs, captions & hashtags
- **📅 Calendar** — 4-week posting schedule with optimal days/times
- **📊 Tracker** — Log posted videos and track views/likes/comments to find your winning niche

## Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/tiktok-growth-engine.git
cd tiktok-growth-engine

# 2. Install
npm install

# 3. Run
npm run dev
```

Open **http://localhost:5173**

## API Key

Get a free Anthropic API key at https://console.anthropic.com/settings/keys  
Paste it into the key field at the top of the app. It saves to localStorage automatically.

## Deploy

```bash
npm run build   # builds frontend to /dist
npm start       # serves on port 3001
```

Deploy to Railway, Render, or Fly.io — set start command to `npm start`, build command to `npm run build`.

## Stack

- React + Vite (frontend)
- Express (backend/API proxy)
- Anthropic Claude API
- Fonts: Bebas Neue + Outfit
