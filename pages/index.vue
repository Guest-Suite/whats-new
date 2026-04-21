<template>
  <div class="page">
    <div class="noise" aria-hidden="true" />

    <!-- Header -->
    <header class="header" :class="{ 'header--scrolled': scrolled }">
      <div class="header__inner">
        <div class="header__brand">
          <svg class="header__logo-mark" fill="none" viewBox="0 0 27 28" xmlns="http://www.w3.org/2000/svg">
            <path d="m6.4863 0.66406c0.19349-0.5236 0.77363-0.79325 1.2988-0.60352l17.653 6.4229c0.5242 0.1939 0.7934 0.77475 0.6025 1.2998l-6.4238 17.646c-0.1939 0.5236-0.7735 0.793-1.2988 0.6035l-4.4727-1.6279-1.3945 3.5947-5.3135-6.0361-6.4727-2.3545c-0.52419-0.1936-0.79449-0.7745-0.60449-1.2998l6.4258-17.646z" fill="#DA3768" />
          </svg>
          <div class="header__brand-text">
            <span class="header__name">Guest Suite</span>
          </div>
        </div>
        <div class="header__actions">
          <button class="header__pres-btn" @click="enterPresentation" title="Mode présentation">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 2.5L11 6.5L2 10.5V2.5Z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            </svg>
            <span class="header__pres-label">Présentation</span>
          </button>
          <a href="https://app.guest-suite.com" target="_blank" rel="noopener noreferrer" class="header__cta">
            <span class="header__cta-label">Accéder à l'app</span>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1.5 9.5L9.5 1.5M9.5 1.5H4M9.5 1.5V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="hero__inner">
        <div class="hero__pill">
          <span class="hero__pill-dot" />
          Nouveautés produit
        </div>
        <h1 class="hero__title">
          Quoi de <span class="hero__accent">neuf ?</span>
        </h1>
        <p class="hero__desc">
          Découvrez les dernières fonctionnalités et améliorations de Guest Suite.
        </p>
      </div>
    </section>

    <!-- Filters -->
    <div v-if="!pending && allTags.length" class="filters">
      <div class="filters__inner">
        <div class="filters__tags">
          <button
            v-for="tag in allTags"
            :key="tag"
            class="filter__tag"
            :class="{ 'filter__tag--active': selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >{{ tag }}</button>
        </div>
        <div class="filters__sep" />
        <div class="filters__tags">
          <button
            v-for="period in DATE_PERIODS"
            :key="period.key"
            class="filter__tag"
            :class="{ 'filter__tag--active': selectedPeriod === period.key }"
            @click="togglePeriod(period.key)"
          >{{ period.label }}</button>
        </div>
        <button v-if="hasActiveFilters" class="filters__reset" @click="resetFilters">
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Timeline -->
    <main class="timeline">
      <div v-if="pending" class="loading">
        <div class="spinner" />
      </div>

      <template v-else-if="groupedEntries.length">
        <div
          v-for="(group, gi) in groupedEntries"
          :key="group.date"
          class="timeline__group"
        >
          <div class="timeline__date-col">
            <div class="timeline__date-sticky">
              <span class="timeline__date-dot" />
              <time class="timeline__date-label">{{ group.label }}</time>
            </div>
            <div class="timeline__connector" />
          </div>

          <div class="timeline__entries">
            <ChangelogEntry
              v-for="(entry, ei) in group.entries"
              :key="entry.id"
              :entry="entry"
              :style="{ animationDelay: `${gi * 60 + ei * 40}ms` }"
              class="entry--animated"
            />
          </div>
        </div>
      </template>

      <div v-else-if="hasActiveFilters" class="empty">
        <svg width="32" height="32" viewBox="0 0 27 28" fill="none">
          <path d="m6.4863 0.66406c0.19349-0.5236 0.77363-0.79325 1.2988-0.60352l17.653 6.4229c0.5242 0.1939 0.7934 0.77475 0.6025 1.2998l-6.4238 17.646c-0.1939 0.5236-0.7735 0.793-1.2988 0.6035l-4.4727-1.6279-1.3945 3.5947-5.3135-6.0361-6.4727-2.3545c-0.52419-0.1936-0.79449-0.7745-0.60449-1.2998l6.4258-17.646z" fill="#F7AAC9" />
        </svg>
        <p>Aucune entrée ne correspond aux filtres sélectionnés.</p>
      </div>

      <div v-else class="empty">
        <svg width="32" height="32" viewBox="0 0 27 28" fill="none">
          <path d="m6.4863 0.66406c0.19349-0.5236 0.77363-0.79325 1.2988-0.60352l17.653 6.4229c0.5242 0.1939 0.7934 0.77475 0.6025 1.2998l-6.4238 17.646c-0.1939 0.5236-0.7735 0.793-1.2988 0.6035l-4.4727-1.6279-1.3945 3.5947-5.3135-6.0361-6.4727-2.3545c-0.52419-0.1936-0.79449-0.7745-0.60449-1.2998l6.4258-17.646z" fill="#F7AAC9" />
        </svg>
        <p>Aucune nouveauté publiée pour l'instant.</p>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <svg width="16" height="16" viewBox="0 0 27 28" fill="none">
            <path d="m6.4863 0.66406c0.19349-0.5236 0.77363-0.79325 1.2988-0.60352l17.653 6.4229c0.5242 0.1939 0.7934 0.77475 0.6025 1.2998l-6.4238 17.646c-0.1939 0.5236-0.7735 0.793-1.2988 0.6035l-4.4727-1.6279-1.3945 3.5947-5.3135-6.0361-6.4727-2.3545c-0.52419-0.1936-0.79449-0.7745-0.60449-1.2998l6.4258-17.646z" fill="#DA3768" />
          </svg>
          <span>© {{ year }} Guest Suite</span>
        </div>
        <a href="https://guest-suite.com" target="_blank" rel="noopener noreferrer" class="footer__link">guest-suite.com</a>
      </div>
    </footer>

    <!-- Presentation overlay -->
    <Teleport to="body">
      <div
        v-if="presentationMode"
        class="pres-overlay"
        @click="handleOverlayClick"
      >
        <!-- Story progress bars -->
        <div class="story-bars">
          <div v-for="(_, i) in flatEntries" :key="i" class="story-bar">
            <div
              v-if="i === presIndex"
              :key="`a-${presProgressKey}`"
              class="story-bar__fill story-bar__fill--active"
              :class="{ 'story-bar__fill--paused': presPaused }"
              @animationend="autoAdvance"
            />
            <div v-else-if="i < presIndex" class="story-bar__fill story-bar__fill--done" />
          </div>
        </div>

        <!-- Nav arrow left -->
        <button
          class="pres-nav pres-nav--prev"
          :disabled="presIndex === 0"
          :style="{ opacity: presIndex === 0 ? 0.3 : 1 }"
          @click.stop="goToEntry(Math.max(0, presIndex - 1))"
          aria-label="Entrée précédente"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Card -->
        <div class="pres-card" role="dialog" aria-modal="true">
          <div class="pres-card__top">
            <span class="pres-counter">{{ presIndex + 1 }} / {{ flatEntries.length }}</span>
            <div class="pres-card__actions">
              <button class="pres-action-btn" @click.stop="presPaused = !presPaused" :aria-label="presPaused ? 'Reprendre' : 'Pause'">
                <svg v-if="presPaused" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 2.5L11 7L3 11.5V2.5Z" fill="currentColor"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2.5" y="2" width="3" height="10" rx="1" fill="currentColor"/>
                  <rect x="8.5" y="2" width="3" height="10" rx="1" fill="currentColor"/>
                </svg>
              </button>
              <button class="pres-close" @click.stop="exitPresentation" aria-label="Fermer">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <template v-if="flatEntries[presIndex]">
            <!-- Date -->
            <p v-if="flatEntries[presIndex].date" class="pres-date">
              {{ new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(flatEntries[presIndex].date)) }}
            </p>

            <!-- Tags -->
            <div v-if="flatEntries[presIndex].tags.length" class="pres-tags">
              <span
                v-for="tag in flatEntries[presIndex].tags"
                :key="tag"
                class="tag"
                :class="`tag--${presTagKey(tag)}`"
              >{{ tag }}</span>
            </div>

            <!-- Title -->
            <h2 class="pres-title">{{ flatEntries[presIndex].titre }}</h2>

            <!-- Media -->
            <div v-if="flatEntries[presIndex]?.media" class="pres-media">
              <img :src="flatEntries[presIndex].media" :alt="flatEntries[presIndex].titre" class="pres-img" loading="lazy">
            </div>

            <!-- Description -->
            <p class="pres-desc">{{ flatEntries[presIndex].description }}</p>

            <!-- CTA -->
            <a
              v-if="flatEntries[presIndex].ctaTexte && flatEntries[presIndex].ctaLien"
              :href="presCtaUrl(flatEntries[presIndex])"
              target="_blank"
              rel="noopener noreferrer"
              class="entry__cta pres-cta"
            >
              {{ flatEntries[presIndex].ctaTexte }}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>

            <!-- Corrections -->
            <div v-if="flatEntries[presIndex].corrections?.length" class="pres-corrections">
              <button class="pres-corrections__toggle" @click.stop="presCorrectionsOpen = !presCorrectionsOpen">
                <span>Corrections ({{ flatEntries[presIndex].corrections.length }})</span>
                <svg class="pres-corrections__chevron" :class="{ 'pres-corrections__chevron--open': presCorrectionsOpen }" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="pres-corrections__body" :class="{ 'pres-corrections__body--open': presCorrectionsOpen }">
                <ul class="pres-corrections__list">
                  <li v-for="(c, i) in parsedPresCorrections" :key="i" class="pres-corrections__item">
                    <span v-if="c.label" class="corrections__pill">{{ c.label }}</span>
                    <span class="pres-corrections__text">{{ c.text }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </template>
        </div>

        <!-- Nav arrow right -->
        <button
          class="pres-nav pres-nav--next"
          :disabled="presIndex === flatEntries.length - 1"
          :style="{ opacity: presIndex === flatEntries.length - 1 ? 0.3 : 1 }"
          @click.stop="goToEntry(Math.min(flatEntries.length - 1, presIndex + 1))"
          aria-label="Entrée suivante"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Hint -->
        <p class="pres-hint">← → pour naviguer &bull; Échap pour fermer</p>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ChangelogItem } from '~/server/types/changelog'

const { data: entries, pending } = await useFetch<ChangelogItem[]>('/api/changelog.json', { key: 'changelog', default: () => [] })

const scrolled = ref(false)
const year = new Date().getFullYear()

// ── Filters ──
const DATE_PERIODS = [
  { key: '30d',  label: '30 derniers jours' },
  { key: '90d',  label: '3 derniers mois' },
  { key: '180d', label: '6 derniers mois' },
]

const selectedTags = ref<string[]>([])
const selectedPeriod = ref<string | null>(null)

const allTags = computed(() => {
  const tags = new Set<string>()
  for (const entry of (entries.value ?? [])) {
    entry.tags.forEach((t: string) => tags.add(t))
  }
  return Array.from(tags)
})

const hasActiveFilters = computed(() => selectedTags.value.length > 0 || !!selectedPeriod.value)

function toggleTag(tag: string) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value = [...selectedTags.value, tag]
  }
}

function togglePeriod(key: string) {
  selectedPeriod.value = selectedPeriod.value === key ? null : key
}

function resetFilters() {
  selectedTags.value = []
  selectedPeriod.value = null
}

const groupedEntries = computed(() => {
  let list = (entries.value ?? []) as any[]

  if (selectedTags.value.length) {
    list = list.filter(e => e.tags.some((t: string) => selectedTags.value.includes(t)))
  }
  if (selectedPeriod.value) {
    const days = parseInt(selectedPeriod.value)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    list = list.filter(e => e.date && e.date >= cutoffStr)
  }

  const groups: Record<string, any> = {}
  for (const entry of list) {
    const date = entry.date ?? 'unknown'
    if (!groups[date]) {
      const d = date !== 'unknown' ? new Date(date) : null
      groups[date] = {
        date,
        label: d ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(d) : '—',
        entries: [],
      }
    }
    groups[date].entries.push(entry)
  }
  return Object.values(groups)
})

// ── Presentation mode ──
const presentationMode = ref(false)
const presIndex = ref(0)
const presProgressKey = ref(0)
const presPaused = ref(false)
const presCorrectionsOpen = ref(false)
const isMobile = ref(false)

const flatEntries = computed(() => groupedEntries.value.flatMap((g: any) => g.entries))

function goToEntry(idx: number) {
  presIndex.value = idx
  presProgressKey.value++
  presCorrectionsOpen.value = false
}

function autoAdvance() {
  if (presPaused.value) return
  if (presIndex.value < flatEntries.value.length - 1) {
    goToEntry(presIndex.value + 1)
  } else {
    exitPresentation()
  }
}

function handleOverlayClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('a, button')) return
  // Desktop: click on backdrop closes
  if (!isMobile.value && target === e.currentTarget) { exitPresentation(); return }
  // Left half = prev, right half = next
  if (e.clientX < window.innerWidth / 2) {
    goToEntry(Math.max(0, presIndex.value - 1))
  } else {
    goToEntry(Math.min(flatEntries.value.length - 1, presIndex.value + 1))
  }
}

import { tagKey as presTagKey, buildCtaUrl, parseListItems } from '~/utils/changelog'

function presCtaUrl(entry: any) {
  return buildCtaUrl(entry.ctaLien)
}

const parsedPresCorrections = computed(() => {
  return parseListItems(flatEntries.value[presIndex.value]?.corrections ?? [])
})

function handleKeydown(e: KeyboardEvent) {
  if (!presentationMode.value) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    goToEntry(Math.min(flatEntries.value.length - 1, presIndex.value + 1))
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    goToEntry(Math.max(0, presIndex.value - 1))
  } else if (e.key === 'Escape') {
    exitPresentation()
  }
}

function enterPresentation() {
  presIndex.value = 0
  presProgressKey.value = 0
  presPaused.value = false
  presCorrectionsOpen.value = false
  presentationMode.value = true
  document.body.style.overflow = 'hidden'
}

function exitPresentation() {
  presentationMode.value = false
  document.body.style.overflow = ''
}

const handleScroll = () => { scrolled.value = window.scrollY > 20 }
const checkMobile = () => { isMobile.value = window.innerWidth <= 580 }

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  checkMobile()
  window.addEventListener('resize', checkMobile, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', checkMobile)
  document.body.style.overflow = ''
})

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap' },
  ],
})
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { overflow-x: clip; }

:root {
  --fuchsia-50:  #FDF2F6;
  --fuchsia-100: #FCE7F0;
  --fuchsia-200: #FAD0E2;
  --fuchsia-500: #E94B82;
  --fuchsia-600: #DA3768;
  --fuchsia-700: #BB1B47;

  --bg:       #FFFFFF;
  --bg-subtle:#F9FAFB;
  --border:   #F0ECF0;
  --border-strong: #E2D9E2;
  --text:     #0B1215;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;

  --font: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  --max-w: 840px;
  --radius: 12px;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
  font-size: 15px;
  line-height: 1.6;
}

.page { min-height: 100vh; }

/* Subtle noise */
.noise {
  position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.02;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ── Header ── */
.header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}
.header--scrolled { border-color: var(--border); }

.header__inner {
  max-width: var(--max-w); margin: 0 auto;
  padding: 0 28px; height: 58px;
  display: flex; align-items: center; justify-content: space-between;
}

.header__brand { display: flex; align-items: center; gap: 10px; }
.header__logo-mark { width: 22px; height: 22px; flex-shrink: 0; }

.header__brand-text {
  display: flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 500;
}
.header__name { color: var(--text); font-weight: 600; }
.header__sep  { color: var(--border-strong); font-weight: 300; }
.header__sub  { color: var(--text-secondary); }

.header__actions {
  display: flex; align-items: center; gap: 8px;
}

.header__pres-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 500;
  color: var(--text-secondary); cursor: pointer;
  padding: 6px 12px; border-radius: 8px;
  border: 1.5px solid var(--border-strong);
  background: transparent;
  font-family: var(--font);
  transition: all 0.15s ease;
}
.header__pres-btn:hover {
  color: var(--text);
  border-color: var(--border-strong);
  background: var(--bg-subtle);
}

.header__cta {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600;
  color: white; text-decoration: none;
  padding: 6px 14px; border-radius: 8px;
  border: 1.5px solid var(--fuchsia-600);
  background: var(--fuchsia-600);
  transition: all 0.15s ease;
}
.header__cta:hover {
  background: var(--fuchsia-700);
  border-color: var(--fuchsia-700);
}

/* ── Hero ── */
.hero {
  max-width: var(--max-w); margin: 0 auto;
  padding: 56px 28px 40px;
  border-bottom: 1px solid var(--border);
}

.hero__pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 500; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--fuchsia-600);
  background: var(--fuchsia-50); border: 1px solid var(--fuchsia-200);
  padding: 5px 12px; border-radius: 100px; margin-bottom: 20px;
}
.hero__pill-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--fuchsia-500); flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(233, 75, 130, 0.2);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(233,75,130,0.2); }
  50%       { box-shadow: 0 0 0 5px rgba(233,75,130,0.08); }
}

.hero__title {
  font-size: clamp(40px, 7vw, 64px);
  font-weight: 700; letter-spacing: -0.03em; line-height: 1;
  color: var(--text); margin-bottom: 16px;
}
.hero__accent { color: var(--fuchsia-600); }

.hero__desc {
  font-size: 16px; color: var(--text-secondary);
  font-weight: 400; line-height: 1.6; max-width: 480px;
}

/* ── Filters ── */
.filters {
  max-width: var(--max-w); margin: 0 auto;
  padding: 16px 28px;
  border-bottom: 1px solid var(--border);
}

.filters__inner {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px 10px;
  width: 100%;
}

.filters__tags {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}

.filter__tag {
  display: inline-flex; align-items: center;
  font-size: 12px; font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1.5px solid var(--border-strong);
  border-radius: 100px;
  padding: 4px 12px;
  cursor: pointer;
  font-family: var(--font);
  transition: all 0.15s ease;
  white-space: nowrap;
}
.filter__tag:hover {
  color: var(--fuchsia-600);
  border-color: var(--fuchsia-200);
  background: var(--fuchsia-50);
}
.filter__tag--active {
  color: var(--fuchsia-700);
  background: var(--fuchsia-100);
  border-color: var(--fuchsia-200);
}

.filters__sep {
  width: 1px; height: 16px;
  background: var(--border-strong);
  flex-shrink: 0;
}

.filters__reset {
  background: none; border: none; cursor: pointer;
  font-family: var(--font);
  font-size: 12.5px; font-weight: 500;
  color: var(--fuchsia-600);
  padding: 4px 2px;
  transition: color 0.15s ease;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.filters__reset:hover { color: var(--fuchsia-700); }

/* ── Timeline ── */
.timeline {
  max-width: var(--max-w); margin: 0 auto;
  padding: 0 28px 80px;
}

.timeline__group {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 0 40px;
  padding-top: 40px;
}

.timeline__date-col { position: relative; }

.timeline__date-sticky {
  position: sticky; top: 76px;
  display: flex; align-items: center; gap: 10px;
  padding: 4px 0;
  background: var(--bg);
  z-index: 2;
}

.timeline__date-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: var(--fuchsia-500);
  box-shadow: 0 0 0 3px var(--bg), 0 0 0 5px var(--fuchsia-200);
  position: relative; z-index: 3;
}

.timeline__date-label {
  font-size: 13px; font-weight: 500;
  color: var(--text-secondary); line-height: 1.3;
}

.timeline__connector {
  position: absolute;
  top: 28px; bottom: -40px;
  left: 3px;
  width: 1px;
  background: linear-gradient(to bottom, var(--border-strong) 0%, var(--border) 60%, transparent 100%);
}
.timeline__group:last-child .timeline__connector { display: none; }

.timeline__entries { padding-bottom: 8px; }

/* ── Entry animation ── */
.entry--animated {
  animation: slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
  opacity: 0;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── States ── */
.loading { display: flex; justify-content: center; padding: 80px 0; }
.spinner {
  width: 22px; height: 22px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--fuchsia-500);
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; padding: 80px 0;
  color: var(--text-muted); font-size: 14px;
}

/* ── Footer ── */
.footer {
  border-top: 1px solid var(--border);
  background: var(--bg-subtle);
}
.footer__inner {
  max-width: var(--max-w); margin: 0 auto;
  padding: 20px 28px;
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12.5px; color: var(--text-muted);
}
.footer__brand { display: flex; align-items: center; gap: 7px; }
.footer__link { color: var(--text-muted); text-decoration: none; }
.footer__link:hover { color: var(--fuchsia-600); }

/* ── Story progress bars ── */
.story-bars {
  display: flex; gap: 4px;
  padding: 0 0 20px;
}
.story-bar {
  flex: 1; height: 2.5px; border-radius: 2px;
  background: var(--border-strong);
  overflow: hidden;
}
.story-bar__fill {
  height: 100%; border-radius: 2px;
  background: var(--fuchsia-500);
}
.story-bar__fill--done { width: 100%; }
.story-bar__fill--active {
  width: 0%;
  animation: storyFill 6s linear forwards;
}
.story-bar__fill--paused { animation-play-state: paused; }
@keyframes storyFill {
  from { width: 0%; }
  to   { width: 100%; }
}

/* ── Presentation overlay ── */
.pres-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0, 0, 0, 0.82);
  display: flex; align-items: center; justify-content: center;
  padding: 24px 80px;
  animation: presIn 0.2s ease both;
}
@keyframes presIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.pres-card {
  background: var(--bg);
  border-radius: 20px;
  padding: 36px 40px;
  max-width: 680px;
  width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  animation: presCardIn 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
  scrollbar-width: thin;
}
@keyframes presCardIn {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.pres-card__top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}

.pres-counter {
  font-size: 12px; font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

.pres-card__actions { display: flex; align-items: center; gap: 6px; }

.pres-action-btn, .pres-close {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--bg-subtle); border: 1px solid var(--border);
  cursor: pointer; color: var(--text-secondary);
  transition: all 0.15s ease;
}
.pres-action-btn:hover, .pres-close:hover { background: var(--border); color: var(--text); }

.pres-date {
  font-size: 12px; font-weight: 500;
  color: var(--text-muted); letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.pres-tags {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-bottom: 12px;
}

.pres-title {
  font-size: 22px; font-weight: 700;
  letter-spacing: -0.025em; line-height: 1.25;
  color: var(--fuchsia-600);
  margin-bottom: 18px;
}

.pres-media {
  border-radius: var(--radius); overflow: hidden;
  margin-bottom: 16px;
  border: 1px solid var(--border);
}
.pres-img {
  display: block; width: 100%;
  max-height: 260px; object-fit: cover;
}

.pres-desc {
  font-size: 14.5px; line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 18px;
}

.pres-cta { margin-bottom: 0; }

.pres-corrections {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.pres-corrections__toggle {
  display: flex; align-items: center; width: 100%;
  background: none; border: none; cursor: pointer;
  padding: 4px 0; font-family: var(--font);
  font-size: 14px; font-weight: 500; color: var(--text);
  text-align: left;
}
.pres-corrections__toggle span { flex: 1; }
.pres-corrections__chevron {
  color: var(--text-muted); transition: transform 0.2s ease;
}
.pres-corrections__chevron--open { transform: rotate(180deg); }
.pres-corrections__body {
  display: grid; grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
}
.pres-corrections__body--open { grid-template-rows: 1fr; }
.pres-corrections__list {
  overflow: hidden; list-style: none; padding: 0; margin: 0;
}
.pres-corrections__item {
  display: flex; align-items: baseline; flex-wrap: wrap; gap: 7px;
  padding: 5px 0; font-size: 14px; color: var(--text-secondary);
}
.pres-corrections__item:first-child { padding-top: 10px; }
.pres-corrections__text { line-height: 1.5; }

/* pill reused from ChangelogEntry global scope not available — define here */
.pres-card .corrections__pill {
  display: inline-flex; align-items: center;
  font-size: 10px; font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* tag classes for presentation (global scope) */
.pres-card .tag {
  display: inline-flex; align-items: center;
  height: 20px; padding: 0 8px; border-radius: 4px;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.03em; text-transform: uppercase;
  font-family: var(--font);
}
.pres-card .tag--new         { background: #F0FDF4; color: #166534; border: 1px solid #DCFCE7; }
.pres-card .tag--improve     { background: #EFF6FF; color: #1D4ED8; border: 1px solid #DBEAFE; }
.pres-card .tag--integration { background: #F0FDF4; color: #166534; border: 1px solid #DCFCE7; }
.pres-card .tag--perf        { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
.pres-card .tag--alerts      { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }
.pres-card .tag--fallback-1  { background: #FDF4FF; color: #86198F; border: 1px solid #F5D0FE; }
.pres-card .tag--fallback-2  { background: #FFF7ED; color: #9A3412; border: 1px solid #FED7AA; }
.pres-card .tag--fallback-3  { background: #F0FDFA; color: #115E59; border: 1px solid #CCFBF1; }
.pres-card .tag--fallback-4  { background: #FEF9C3; color: #854D0E; border: 1px solid #FDE047; }
.pres-card .tag--fallback-5  { background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; }
.pres-card .tag--fallback-6  { background: #FCE7F3; color: #9D174D; border: 1px solid #FBCFE8; }
.pres-card .tag--default     { background: var(--bg-subtle); color: var(--text-secondary); border: 1px solid var(--border); }

/* entry__cta reused */
.pres-card .entry__cta {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600;
  color: var(--fuchsia-600); text-decoration: none;
  padding: 7px 14px; border-radius: 8px;
  border: 1.5px solid var(--fuchsia-200);
  background: var(--fuchsia-50);
  transition: all 0.15s ease;
  font-family: var(--font);
}
.pres-card .entry__cta:hover {
  background: var(--fuchsia-600); color: white;
  border-color: var(--fuchsia-600);
}

/* Nav arrows */
.pres-nav {
  position: fixed;
  top: 50%; transform: translateY(-50%);
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(255,255,255,0.12);
  border: 1.5px solid rgba(255,255,255,0.2);
  color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, opacity 0.15s ease;
  backdrop-filter: blur(8px);
  z-index: 201;
}
.pres-nav:hover:not(:disabled) { background: rgba(255,255,255,0.22); }
.pres-nav:disabled { cursor: default; }
.pres-nav--prev { left: 20px; }
.pres-nav--next { right: 20px; }

.pres-hint {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  font-size: 12px; color: rgba(255,255,255,0.4);
  white-space: nowrap;
  pointer-events: none;
}

/* ── Responsive ── */
@media (max-width: 580px) {
  .header__hide-mobile { display: none; }
  .header__cta-label { display: none; }
  .header__cta { padding: 7px 10px; }
  .header__pres-label { display: none; }
  .header__pres-btn { padding: 7px 10px; }

  .filters__sep { display: none; }

  .hero__title { font-size: 36px; }

  .timeline__group { grid-template-columns: 1fr; gap: 8px 0; }
  .timeline__date-sticky { position: static; background: transparent; }
  .timeline__connector { display: none; }
  .timeline__entries { padding-left: 18px; border-left: 1px solid var(--border); margin-left: 3px; }

  /* ── Story mode mobile ── */
  .pres-overlay {
    padding: 0;
    background: white;
    align-items: flex-start;
  }
  .pres-card {
    border-radius: 0;
    width: 100vw; max-width: 100vw;
    min-height: 100dvh; max-height: 100dvh;
    padding: 72px 24px 40px;
    box-shadow: none;
    overflow-y: auto;
  }
  .story-bars {
    position: fixed;
    top: 0; left: 0; right: 0;
    padding: 14px 16px 0;
    background: white;
    z-index: 210;
  }
  .story-bar { background: var(--border-strong); height: 3px; }
  .pres-nav { display: none; }
  .pres-hint { display: none; }
  .pres-card__top { position: fixed; top: 36px; right: 16px; z-index: 211; }
  .pres-counter { display: none; }
}
</style>
