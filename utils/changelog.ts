export const APP_BASE = 'https://app.guest-suite.com'

export const TAG_KEYS: Record<string, string> = {
  'Nouveau':      'new',
  'Amélioration': 'improve',
  'Intégration':  'integration',
  'Performance':  'perf',
}

export function tagKey(tag: string): string {
  return TAG_KEYS[tag] ?? 'default'
}

const ALLOWED_HOSTS = ['app.guest-suite.com', 'guest-suite.com', 'www.guest-suite.com']

export function buildCtaUrl(ctaLien: string | null): string {
  const l = ctaLien ?? ''
  if (l.startsWith('/')) return `${APP_BASE}${l}`
  try {
    const url = new URL(l)
    if (ALLOWED_HOSTS.includes(url.hostname) && ['https:', 'http:'].includes(url.protocol)) {
      return l
    }
  }
  catch { /* invalid URL */ }
  return APP_BASE
}

export function parseListItems(items: string[]): Array<{ label: string | null; text: string }> {
  return items.map((line) => {
    const idx = line.indexOf(' - ')
    if (idx !== -1) {
      return { label: line.slice(0, idx), text: line.slice(idx + 3) }
    }
    return { label: null, text: line }
  })
}
