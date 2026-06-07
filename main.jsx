import { useState, useEffect } from 'react'

const NICHE_OPTIONS = [
  '🎵 Music / Artist', '💪 Fitness', '💰 Money / Finance', '🍳 Food / Cooking',
  '✈️ Travel', '👗 Fashion / Style', '😂 Comedy / Skits', '🧠 Self Improvement',
  '🎮 Gaming', '💼 Business / Hustle', '🌿 Wellness', '📱 Tech / Apps',
  '🎨 Art / Creative', '🏠 Home / Lifestyle', '❤️ Relationships'
]

const POSTS_OPTIONS = [3, 4, 5, 6, 7]

const scoreColor = s => s >= 85 ? '#00ff88' : s >= 70 ? '#ffcc00' : '#ff6b6b'
const formatBadgeColor = f => ({
  'POV': '#ff2d55', 'Storytime': '#ff9500', 'Tutorial': '#00d4ff',
  'Trend': '#bf5af2', 'Reaction': '#ff6b35', 'Day-in-life': '#30d158',
  'Transformation': '#ffd60a', 'Hot take': '#ff375f'
}[f] || '#555')

export default function App() {
  const [apiKey, setApiKey]     = useState(() => localStorage.getItem('tge_key') || '')
  const [showKey, setShowKey]   = useState(false)
  const [niches, setNiches]     = useState([])
  const [ppw, setPpw]           = useState(4)
  const [view, setView]         = useState('setup') // setup | ideas | script | calendar | tracker
  const [ideas, setIdeas]       = useState([])
  const [calendar, setCalendar] = useState([])
  const [script, setScript]     = useState(null)
  const [scriptIdea, setScriptIdea] = useState(null)
  const [loading, setLoading]   = useState('')
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState('')
  const [tracker, setTracker]   = useState(() => JSON.parse(localStorage.getItem('tge_tracker') || '[]'))
  const [logForm, setLogForm]   = useState({ title: '', views: '', likes: '', comments: '', niche: '', posted: '' })
  const [calWeek, setCalWeek]   = useState(0)

  const saveKey = k => { setApiKey(k); localStorage.setItem('tge_key', k) }
  const saveTracker = t => { setTracker(t); localStorage.setItem('tge_tracker', JSON.stringify(t)) }

  const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key); setTimeout(() => setCopied(''), 1800)
  }

  const api = async (endpoint, body) => {
    if (!apiKey) throw new Error('Add your Anthropic API key first')
    const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const generateIdeas = async () => {
    if (!apiKey) { setError('Enter your API key first'); return }
    setLoading('ideas'); setError('')
    try {
      const data = await api('/api/ideas', { niches, postsPerWeek: ppw })
      setIdeas(data); setView('ideas')
    } catch (e) { setError(e.message) }
    setLoading('')
  }

  const generateScript = async (idea) => {
    setLoading('script'); setError(''); setScriptIdea(idea)
    try {
      const data = await api('/api/script', { idea })
      setScript(data); setView('script')
    } catch (e) { setError(e.message) }
    setLoading('')
  }

  const generateCalendar = async () => {
    if (!ideas.length) { setError('Generate ideas first'); return }
    setLoading('calendar'); setError('')
    try {
      const data = await api('/api/calendar', { ideas, postsPerWeek: ppw })
      setCalendar(data); setView('calendar')
    } catch (e) { setError(e.message) }
    setLoading('')
  }

  const logPost = () => {
    if (!logForm.title) return
    const entry = { ...logForm, id: Date.now(), date: new Date().toLocaleDateString() }
    saveTracker([entry, ...tracker])
    setLogForm({ title: '', views: '', likes: '', comments: '', niche: '', posted: '' })
  }

  const toggleNiche = n => setNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])

  // ── TOP NAV ─────────────────────────────────────────────────────
  const NavBtn = ({ id, label }) => (
    <button onClick={() => setView(id)} style={{
      padding: '8px 16px', borderRadius: 6, border: 'none', fontSize: 13,
      background: view === id ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
      color: view === id ? '#fff' : 'var(--muted)', fontWeight: view === id ? 600 : 400,
      transition: 'all .15s',
    }}>{label}</button>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, #0f0f0f 0%, #080808 100%)',
        padding: '18px 24px 14px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>🎯</span>
              <div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: '0.06em', color: '#fff', lineHeight: 1 }}>
                  TIKTOK GROWTH ENGINE
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Ideas · Scripts · Calendar · Tracker
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <NavBtn id="setup"    label="⚙️ Setup" />
              <NavBtn id="ideas"    label="💡 Ideas" />
              <NavBtn id="script"   label="📝 Script" />
              <NavBtn id="calendar" label="📅 Calendar" />
              <NavBtn id="tracker"  label="📊 Tracker" />
            </div>
          </div>

          {/* API Key */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 460 }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => saveKey(e.target.value)}
                placeholder="Anthropic API key (sk-ant-...)"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: 7, padding: '8px 38px 8px 12px', color: '#e8e8e8', fontSize: 12,
                }}
              />
              <button onClick={() => setShowKey(v => !v)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13,
              }}>{showKey ? '🙈' : '👁'}</button>
            </div>
            {apiKey
              ? <span style={{ fontSize: 11, color: '#00ff88' }}>✓ Key saved</span>
              : <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: 'var(--accent2)', textDecoration: 'none' }}>Get key →</a>
            }
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 80px' }}>
        {error && (
          <div style={{
            background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)',
            borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#ff6b6b',
          }}>⚠ {error}</div>
        )}

        {/* ══ SETUP ══ */}
        {view === 'setup' && (
          <div className="fade-up">
            <SectionTitle>Pick Niches to Test</SectionTitle>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              Select 3–5 niches. We'll generate ideas across all of them so you can see what gets traction.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
              {NICHE_OPTIONS.map(n => (
                <button key={n} onClick={() => toggleNiche(n)} style={{
                  padding: '9px 16px', borderRadius: 20, border: `1px solid ${niches.includes(n) ? 'var(--accent)' : 'var(--border)'}`,
                  background: niches.includes(n) ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.03)',
                  color: niches.includes(n) ? '#fff' : 'var(--muted)', fontSize: 13, transition: 'all .15s',
                }}>{n}</button>
              ))}
            </div>

            <SectionTitle>Posts Per Week</SectionTitle>
            <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
              {POSTS_OPTIONS.map(n => (
                <button key={n} onClick={() => setPpw(n)} style={{
                  width: 52, height: 52, borderRadius: 10,
                  border: `1px solid ${ppw === n ? 'var(--accent)' : 'var(--border)'}`,
                  background: ppw === n ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.03)',
                  color: ppw === n ? '#fff' : 'var(--muted)', fontSize: 18, fontWeight: 700,
                }}>{n}</button>
              ))}
            </div>

            {niches.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '14px 18px', marginBottom: 28, fontSize: 13, color: '#aaa',
              }}>
                Testing: <strong style={{ color: '#fff' }}>{niches.join(' · ')}</strong><br />
                <span style={{ color: 'var(--muted)' }}>Posting {ppw}x/week → {ppw * 4} videos/month</span>
              </div>
            )}

            <BigBtn onClick={generateIdeas} loading={loading === 'ideas'} disabled={loading === 'ideas'}>
              {loading === 'ideas' ? '⏳ Generating Ideas...' : '⚡ Generate My Content Ideas'}
            </BigBtn>
          </div>
        )}

        {/* ══ IDEAS ══ */}
        {view === 'ideas' && (
          <div className="fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <SectionTitle style={{ marginBottom: 4 }}>Your {ideas.length} Content Ideas</SectionTitle>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>Click any idea to get a full script ready to film.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <SmallBtn onClick={generateIdeas} loading={loading === 'ideas'}>🔄 Regenerate</SmallBtn>
                <SmallBtn onClick={generateCalendar} loading={loading === 'calendar'} accent>📅 Build Calendar</SmallBtn>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {ideas.map((idea, i) => (
                <div key={idea.id || i} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
                  transition: 'border-color .15s, background .15s',
                  borderLeft: `3px solid ${formatBadgeColor(idea.format)}`,
                }}
                  onClick={() => generateScript(idea)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Badge color={formatBadgeColor(idea.format)}>{idea.format}</Badge>
                      <Badge color="#333">{idea.niche}</Badge>
                      <Badge color="#333">{idea.duration}</Badge>
                      <Badge color={idea.difficulty === 'Easy' ? '#1a3a1a' : idea.difficulty === 'Medium' ? '#3a2a00' : '#3a1a1a'}
                        textColor={idea.difficulty === 'Easy' ? '#00ff88' : idea.difficulty === 'Medium' ? '#ffcc00' : '#ff6b6b'}>
                        {idea.difficulty}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(idea.viralPotential) }}>{idea.viralPotential}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>viral</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>{idea.title}</div>
                  <div style={{ fontSize: 12, color: '#777', marginBottom: 8 }}>
                    <span style={{ color: 'var(--accent)' }}>Hook: </span>{idea.hook}
                  </div>
                  <div style={{ fontSize: 11, color: '#555' }}>{idea.angle}</div>
                  <div style={{ marginTop: 12, fontSize: 11, color: 'var(--accent2)' }}>Tap to generate full script →</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ SCRIPT ══ */}
        {view === 'script' && (
          <div className="fade-up">
            {loading === 'script' ? (
              <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ fontSize: 40, display: 'inline-block', animation: 'spin 1s linear infinite' }}>📝</div>
                <div style={{ marginTop: 20, color: 'var(--muted)', letterSpacing: '0.1em' }}>WRITING YOUR SCRIPT...</div>
              </div>
            ) : script ? (
              <div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
                  <button onClick={() => setView('ideas')} style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '7px 14px', color: 'var(--muted)', fontSize: 12,
                  }}>← Back</button>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{scriptIdea?.title}</div>
                </div>

                {/* Hook */}
                <div style={{
                  background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.2)',
                  borderRadius: 10, padding: '16px 20px', marginBottom: 20,
                }}>
                  <Label>🔥 Opening Hook (first 3 seconds)</Label>
                  <div style={{ fontSize: 16, color: '#fff', marginTop: 6, lineHeight: 1.5 }}>{script.hook}</div>
                </div>

                {/* Scenes */}
                <SectionTitle>Scene-by-Scene Script</SectionTitle>
                {script.scenes?.map((s, i) => (
                  <div key={i} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '14px 18px', marginBottom: 10,
                    borderLeft: '3px solid var(--accent2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Badge color="rgba(0,212,255,0.15)" textColor="var(--accent2)">{s.timestamp}</Badge>
                      {s.transition && <span style={{ fontSize: 11, color: 'var(--muted)' }}>🔀 {s.transition}</span>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <SceneRow icon="🎬" label="Action" val={s.action} />
                      {s.dialogue && <SceneRow icon="🗣️" label="Say This" val={s.dialogue} highlight />}
                      {s.textOverlay && <SceneRow icon="✍️" label="Text Overlay" val={s.textOverlay} />}
                    </div>
                  </div>
                ))}

                {/* CTA */}
                <div style={{
                  background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
                  borderRadius: 10, padding: '14px 18px', marginBottom: 24,
                }}>
                  <Label>📣 Call to Action</Label>
                  <div style={{ fontSize: 14, color: '#fff', marginTop: 6 }}>{script.cta}</div>
                </div>

                {/* Caption + hashtags */}
                <SectionTitle>Caption & Hashtags</SectionTitle>
                <CopyBlock text={script.caption} label="Caption" onCopy={() => copy(script.caption, 'cap')} copied={copied === 'cap'} />
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '14px 18px', marginBottom: 24,
                  display: 'flex', flexWrap: 'wrap', gap: 8,
                }}>
                  {script.hashtags?.map((h, i) => (
                    <span key={i} style={{
                      background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
                      borderRadius: 4, padding: '4px 10px', fontSize: 13, color: 'var(--accent2)',
                    }}>#{h.replace(/^#/, '')}</span>
                  ))}
                  <button onClick={() => copy(script.hashtags.map(h => `#${h.replace(/^#/, '')}`).join(' '), 'tags')} style={{
                    background: 'transparent', border: '1px dashed #333', borderRadius: 4,
                    padding: '4px 10px', fontSize: 11, color: 'var(--muted)',
                  }}>{copied === 'tags' ? '✓ Copied' : 'Copy All'}</button>
                </div>

                {/* Filming + editing tips */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <SectionTitle>📱 Filming Tips</SectionTitle>
                    {script.filmingTips?.map((t, i) => <TipRow key={i} n={i+1} text={t} />)}
                  </div>
                  <div>
                    <SectionTitle>✂️ CapCut Editing</SectionTitle>
                    <div style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '14px 16px', fontSize: 13, color: '#ccc', lineHeight: 1.7,
                    }}>{script.editingNotes}</div>
                  </div>
                </div>

                <button onClick={() => setView('ideas')} style={{
                  width: '100%', padding: 14, background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border)', borderRadius: 10, color: '#aaa', fontSize: 14,
                }}>← Back to Ideas</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 80, color: 'var(--muted)' }}>
                Go to Ideas and tap a card to generate a script.
              </div>
            )}
          </div>
        )}

        {/* ══ CALENDAR ══ */}
        {view === 'calendar' && (
          <div className="fade-up">
            {loading === 'calendar' ? (
              <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ fontSize: 40, display: 'inline-block', animation: 'spin 1s linear infinite' }}>📅</div>
                <div style={{ marginTop: 20, color: 'var(--muted)', letterSpacing: '0.1em' }}>BUILDING YOUR CALENDAR...</div>
              </div>
            ) : calendar.length ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <SectionTitle style={{ marginBottom: 0 }}>4-Week Posting Calendar</SectionTitle>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {calendar.map((w, i) => (
                      <button key={i} onClick={() => setCalWeek(i)} style={{
                        padding: '6px 14px', borderRadius: 6, border: `1px solid ${calWeek === i ? 'var(--accent)' : 'var(--border)'}`,
                        background: calWeek === i ? 'rgba(255,45,85,0.15)' : 'transparent',
                        color: calWeek === i ? '#fff' : 'var(--muted)', fontSize: 12,
                      }}>Week {i+1}</button>
                    ))}
                  </div>
                </div>

                {calendar[calWeek] && (
                  <div>
                    <div style={{
                      background: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.15)',
                      borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#aaa',
                    }}>
                      <strong style={{ color: '#fff' }}>Week {calWeek+1} Theme:</strong> {calendar[calWeek].theme}
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                      {calendar[calWeek].posts?.map((p, i) => (
                        <div key={i} style={{
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 10, padding: '14px 18px',
                          display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 16, alignItems: 'center',
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{p.day}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.bestTime}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{p.ideaTitle}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.why}</div>
                          </div>
                          <Badge color="#1a1a1a">{p.niche}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Generate ideas first, then build your calendar.</p>
                <SmallBtn onClick={() => setView('ideas')}>Go to Ideas</SmallBtn>
              </div>
            )}
          </div>
        )}

        {/* ══ TRACKER ══ */}
        {view === 'tracker' && (
          <div className="fade-up">
            <SectionTitle>Performance Tracker</SectionTitle>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Log your posted videos here. Over time you'll see which niches and formats perform best.
            </p>

            {/* Log form */}
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '20px', marginBottom: 28,
            }}>
              <Label style={{ marginBottom: 14 }}>Log a Posted Video</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <input value={logForm.title} onChange={e => setLogForm(f => ({...f, title: e.target.value}))}
                  placeholder="Video title / concept" style={inputStyle} />
                <input value={logForm.niche} onChange={e => setLogForm(f => ({...f, niche: e.target.value}))}
                  placeholder="Niche" style={inputStyle} />
                <input value={logForm.views} onChange={e => setLogForm(f => ({...f, views: e.target.value}))}
                  placeholder="Views" type="number" style={inputStyle} />
                <input value={logForm.likes} onChange={e => setLogForm(f => ({...f, likes: e.target.value}))}
                  placeholder="Likes" type="number" style={inputStyle} />
                <input value={logForm.comments} onChange={e => setLogForm(f => ({...f, comments: e.target.value}))}
                  placeholder="Comments" type="number" style={inputStyle} />
                <input value={logForm.posted} onChange={e => setLogForm(f => ({...f, posted: e.target.value}))}
                  placeholder="Date posted (e.g. Jun 6)" style={inputStyle} />
              </div>
              <button onClick={logPost} style={{
                width: '100%', padding: '11px', background: 'var(--accent)',
                border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600,
              }}>+ Log Video</button>
            </div>

            {/* Stats summary */}
            {tracker.length > 0 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'Videos Posted', val: tracker.length },
                    { label: 'Total Views', val: tracker.reduce((a, v) => a + (parseInt(v.views) || 0), 0).toLocaleString() },
                    { label: 'Avg Views', val: Math.round(tracker.reduce((a, v) => a + (parseInt(v.views) || 0), 0) / tracker.length).toLocaleString() },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '16px', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Bebas Neue', letterSpacing: '0.05em' }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <SectionTitle>Posted Videos</SectionTitle>
                <div style={{ display: 'grid', gap: 8 }}>
                  {tracker.map((v, i) => (
                    <div key={v.id} style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '14px 18px',
                      display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{v.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {v.niche && <span style={{ marginRight: 12 }}>{v.niche}</span>}
                          {v.posted && <span>{v.posted}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
                        {[['👁', v.views, 'views'], ['❤️', v.likes, 'likes'], ['💬', v.comments, 'comments']].map(([icon, val, lbl]) => (
                          val ? <div key={lbl}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{parseInt(val).toLocaleString()}</div>
                            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{icon} {lbl}</div>
                          </div> : null
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => { if(confirm('Clear all tracker data?')) saveTracker([]) }} style={{
                  marginTop: 16, padding: '8px 16px', background: 'transparent',
                  border: '1px dashed #333', borderRadius: 6, color: '#555', fontSize: 12,
                }}>Clear Tracker</button>
              </div>
            )}

            {!tracker.length && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: 13 }}>
                No videos logged yet. Post something and track it here to find your winning niche.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── UI Helpers ──────────────────────────────────────────────────

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #1c1c1c',
  borderRadius: 7, color: '#e8e8e8', padding: '9px 12px', fontSize: 13,
}

function SectionTitle({ children, style: s }) {
  return <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: '0.06em', color: '#fff', marginBottom: 16, ...s }}>{children}</div>
}

function Label({ children, style: s }) {
  return <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, ...s }}>{children}</div>
}

function Badge({ children, color, textColor }) {
  return (
    <span style={{
      background: color || 'var(--dim)', color: textColor || '#aaa',
      padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 600,
    }}>{children}</span>
  )
}

function BigBtn({ children, onClick, loading, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '16px', border: 'none', borderRadius: 10,
      background: disabled ? '#222' : 'var(--accent)',
      color: disabled ? '#555' : '#fff', fontSize: 15, fontWeight: 700,
      letterSpacing: '0.04em',
    }}>{children}</button>
  )
}

function SmallBtn({ children, onClick, accent, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      padding: '8px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600,
      border: `1px solid ${accent ? 'var(--accent)' : 'var(--border)'}`,
      background: accent ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.05)',
      color: accent ? '#fff' : '#aaa',
    }}>{loading ? '⏳' : children}</button>
  )
}

function CopyBlock({ text, label, onCopy, copied }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 16px', marginBottom: 12,
      display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start',
    }}>
      <div>
        <Label style={{ marginBottom: 4 }}>{label}</Label>
        <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.6 }}>{text}</div>
      </div>
      <button onClick={onCopy} style={{
        minWidth: 64, padding: '6px 12px', borderRadius: 6, fontSize: 11,
        background: copied ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
        color: copied ? '#00ff88' : '#555',
      }}>{copied ? '✓ Done' : 'Copy'}</button>
    </div>
  )
}

function SceneRow({ icon, label, val, highlight }) {
  return (
    <div>
      <Label style={{ marginBottom: 3 }}>{icon} {label}</Label>
      <div style={{ fontSize: 13, color: highlight ? '#fff' : '#bbb', lineHeight: 1.5 }}>{val}</div>
    </div>
  )
}

function TipRow({ n, text }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '10px 14px', marginBottom: 8,
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
    }}>
      <span style={{
        minWidth: 22, height: 22, background: 'rgba(255,45,85,0.15)',
        borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: 'var(--accent)', fontWeight: 700,
      }}>{n}</span>
      <span style={{ fontSize: 12, color: '#bbb', lineHeight: 1.5 }}>{text}</span>
    </div>
  )
}
