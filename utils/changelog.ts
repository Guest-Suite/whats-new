export const APP_BASE = 'https://app.guest-suite.com'

export const TAG_KEYS: Record<string, string> = {
  'Nouveau':      'new',
  'Amélioration': 'improve',
  'Intégration':  'integration',
  'Performance':  'perf',
  'Alertes':      'alerts',
}

/** Palette de couleurs pour les tags dynamiques non listés dans TAG_KEYS */
const FALLBACK_PALETTE = ['fallback-1', 'fallback-2', 'fallback-3', 'fallback-4', 'fallback-5', 'fallback-6']
const dynamicTagCache = new Map<string, string>()
let fallbackIndex = 0

export function tagKey(tag: string): string {
  if (TAG_KEYS[tag]) return TAG_KEYS[tag]
  if (!dynamicTagCache.has(tag) && fallbackIndex < FALLBACK_PALETTE.length) {
    dynamicTagCache.set(tag, FALLBACK_PALETTE[fallbackIndex++])
  }
  return dynamicTagCache.get(tag) ?? 'default'
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
