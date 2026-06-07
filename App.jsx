*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #080808;
  --surface: #111111;
  --border: #1c1c1c;
  --accent: #ff2d55;
  --accent2: #00d4ff;
  --text: #f0f0f0;
  --muted: #555;
  --dim: #2a2a2a;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Outfit', sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #0a0a0a; }
::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }

textarea, input { outline: none; font-family: inherit; }
button { cursor: pointer; font-family: inherit; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.fade-up { animation: fadeUp 0.4s ease forwards; }
