import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.static(join(__dirname, 'dist')))

function getClient(req) {
  const key = req.headers['x-api-key']
  if (!key) throw { status: 401, message: 'Missing API key' }
  return new Anthropic({ apiKey: key })
}

async function ask(client, prompt, max_tokens = 1024) {
  const msg = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens,
    messages: [{ role: 'user', content: prompt }]
  })
  const raw = msg.content?.[0]?.text || ''
  return raw.replace(/```json|```/g, '').trim()
}

// ── IDEAS endpoint ──────────────────────────────────────────────
app.post('/api/ideas', async (req, res) => {
  try {
    const client = getClient(req)
    const { niches, postsPerWeek } = req.body
    const nicheList = niches?.length ? niches.join(', ') : 'lifestyle, music, motivation, day-in-life, behind-the-scenes'

    const prompt = `You are a viral TikTok strategist. Generate a week of TikTok content ideas for a creator posting ${postsPerWeek}x per week who is testing these niches: ${nicheList}.

Return ONLY a JSON array (no markdown) of exactly ${postsPerWeek} video ideas:
[
  {
    "id": "1",
    "niche": "niche name",
    "title": "punchy video concept title",
    "hook": "exact first 3 seconds — what you say or show to stop the scroll",
    "angle": "why this will perform well right now",
    "format": "one of: POV, Storytime, Tutorial, Trend, Reaction, Day-in-life, Transformation, Hot take",
    "duration": "one of: 15s, 30s, 60s",
    "difficulty": "Easy | Medium | Hard",
    "viralPotential": 88
  }
]

Mix formats and niches. Make hooks specific and scroll-stopping. viralPotential is 1-100.`

    const json = await ask(client, prompt, 1024)
    res.json(JSON.parse(json))
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message })
  }
})

// ── SCRIPT endpoint ─────────────────────────────────────────────
app.post('/api/script', async (req, res) => {
  try {
    const client = getClient(req)
    const { idea } = req.body

    const prompt = `You are a viral TikTok scriptwriter. Write a complete, ready-to-film TikTok script for this idea:

Title: ${idea.title}
Hook: ${idea.hook}
Format: ${idea.format}
Duration: ${idea.duration}
Niche: ${idea.niche}

Return ONLY a JSON object (no markdown):
{
  "hook": "exact word-for-word opening line (first 3 seconds)",
  "scenes": [
    {
      "timestamp": "0:00-0:03",
      "action": "what you physically do on camera",
      "dialogue": "exactly what you say (word for word)",
      "textOverlay": "on-screen text if any",
      "transition": "cut/zoom/swipe/freeze etc"
    }
  ],
  "cta": "exact call-to-action at the end",
  "caption": "full TikTok caption optimized for discovery",
  "hashtags": ["tag1","tag2","tag3","tag4","tag5"],
  "filmingTips": ["tip1","tip2","tip3"],
  "editingNotes": "specific CapCut editing instructions for this video"
}`

    const json = await ask(client, prompt, 1024)
    res.json(JSON.parse(json))
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message })
  }
})

// ── CALENDAR endpoint ────────────────────────────────────────────
app.post('/api/calendar', async (req, res) => {
  try {
    const client = getClient(req)
    const { ideas, postsPerWeek } = req.body

    const prompt = `You are a TikTok growth strategist. Create a 4-week posting calendar using these ${ideas.length} video ideas. Post ${postsPerWeek}x per week.

Ideas available: ${ideas.map(i => `"${i.title}" (${i.niche}, ${i.format})`).join(', ')}

Return ONLY a JSON array of 4 weeks (no markdown):
[
  {
    "week": 1,
    "theme": "week theme or focus",
    "posts": [
      {
        "day": "Monday",
        "date": "Week 1 Mon",
        "ideaTitle": "exact title from ideas list",
        "niche": "niche",
        "bestTime": "7pm" ,
        "why": "one sentence why this day/time"
      }
    ]
  }
]

Spread niches across the week. Schedule high-viral-potential posts at peak times (Tue/Thu/Fri evenings). Mix formats so the feed stays interesting.`

    const json = await ask(client, prompt, 1024)
    res.json(JSON.parse(json))
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message })
  }
})

app.get('*', (req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))

app.listen(PORT, () => console.log(`\n🚀 TikTok Growth Engine → http://localhost:${PORT}\n`))
