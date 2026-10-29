// Applies the saved theme before the first paint (no flash of the wrong theme).
// A separate file, not an inline script, so the CSP can stay `script-src 'self'`.
try {
  const s = JSON.parse(localStorage.getItem('pulsefit-settings') || '{}')
  if (s.state && s.state.theme) document.documentElement.dataset.theme = s.state.theme
} catch {}
