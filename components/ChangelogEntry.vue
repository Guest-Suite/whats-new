<template>
  <article :id="entry.id" class="entry">
    <!-- Tags -->
    <div v-if="entry.tags.length" class="entry__tags">
      <span
        v-for="tag in entry.tags"
        :key="tag"
        class="tag"
        :class="`tag--${tagKey(tag)}`"
      >{{ tag }}</span>
    </div>

    <!-- Title -->
    <h2 class="entry__title">{{ entry.titre }}</h2>

    <!-- Media -->
    <div v-if="entry.media" class="entry__media">
      <img
        :src="entry.media"
        :alt="entry.titre"
        class="entry__img"
        loading="lazy"
      >
    </div>

    <!-- Description -->
    <p class="entry__desc">{{ entry.description }}</p>

    <!-- CTA -->
    <a
      v-if="entry.ctaTexte && entry.ctaLien"
      :href="ctaUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="entry__cta"
    >
      {{ entry.ctaTexte }}
      <svg class="entry__cta-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>

    <!-- Corrections -->
    <div v-if="parsedCorrections.length" class="corrections">
      <button
        class="corrections__toggle"
        :aria-expanded="correctionsOpen"
        @click="correctionsOpen = !correctionsOpen"
      >
        <span class="corrections__label">Corrections ({{ parsedCorrections.length }})</span>
        <svg
          class="corrections__chevron"
          :class="{ 'corrections__chevron--open': correctionsOpen }"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="corrections__body" :class="{ 'corrections__body--open': correctionsOpen }">
        <ul class="corrections__list">
          <li v-for="(c, i) in parsedCorrections" :key="i" class="corrections__item">
            <span v-if="c.label" class="corrections__pill">{{ c.label }}</span>
            <span class="corrections__text">{{ c.text }}</span>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{
  entry: {
    id: string
    titre: string
    description: string
    date: string | null
    media: string | null
    ctaTexte: string | null
    ctaLien: string | null
    tags: string[]
    corrections?: string[]
  }
}>()

import { tagKey, buildCtaUrl, parseListItems } from '~/utils/changelog'

const ctaUrl = computed(() => buildCtaUrl(props.entry.ctaLien))

const correctionsOpen = ref(false)

const parsedCorrections = computed(() => parseListItems(props.entry.corrections ?? []))
</script>

<style scoped>
.entry {
  padding: 28px 0;
  border-bottom: 1px solid var(--border);
  scroll-margin-top: 80px;
}
.entry:target {
  animation: entry-highlight 1.8s ease forwards;
}
@keyframes entry-highlight {
  0%   { background: #FDF2F6; border-radius: 12px; }
  60%  { background: #FDF2F6; border-radius: 12px; }
  100% { background: transparent; }
}
.entry:last-child { border-bottom: none; padding-bottom: 0; }

/* Tags */
.entry__tags {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-bottom: 10px;
}
.tag {
  display: inline-flex; align-items: center;
  height: 20px; padding: 0 8px; border-radius: 4px;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.03em; text-transform: uppercase;
  font-family: var(--font);
}
.tag--new         { background: #F0FDF4; color: #166534; border: 1px solid #DCFCE7; }
.tag--improve     { background: #EFF6FF; color: #1D4ED8; border: 1px solid #DBEAFE; }
.tag--integration { background: #F0FDF4; color: #166534; border: 1px solid #DCFCE7; }
.tag--perf        { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
.tag--default     { background: var(--bg-subtle); color: var(--text-secondary); border: 1px solid var(--border); }

/* Title */
.entry__title {
  font-size: 19px; font-weight: 700;
  letter-spacing: -0.02em; line-height: 1.3;
  color: var(--text); margin-bottom: 16px;
}

/* Media */
.entry__media {
  border-radius: var(--radius); overflow: hidden;
  margin-bottom: 14px;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  transition: box-shadow 0.2s ease;
}
.entry__media:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.06); }

.entry__img {
  width: 100%; display: block;
  max-height: 300px; object-fit: cover;
}


/* Description */
.entry__desc {
  font-size: 14.5px; line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 18px; font-weight: 400;
}

/* CTA */
.entry__cta {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600;
  color: var(--fuchsia-600); text-decoration: none;
  padding: 7px 14px; border-radius: 8px;
  border: 1.5px solid var(--fuchsia-200);
  background: var(--fuchsia-50);
  transition: all 0.15s ease;
  font-family: var(--font);
}
.entry__cta:hover {
  background: var(--fuchsia-600); color: white;
  border-color: var(--fuchsia-600);
}
.entry__cta-icon { transition: transform 0.15s ease; }
.entry__cta:hover .entry__cta-icon { transform: translate(1px, -1px); }

/* Corrections */
.corrections {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.corrections__toggle {
  display: flex; align-items: center; width: 100%;
  background: none; border: none; cursor: pointer; padding: 6px 0;
  color: var(--text);
  font-family: var(--font);
  font-size: 14px; font-weight: 500;
  transition: color 0.15s ease;
  text-align: left;
}
.corrections__toggle:hover { color: var(--text); }
.corrections__label { flex: 1; }

.corrections__chevron {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}
.corrections__chevron--open { transform: rotate(90deg); }

.corrections__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s ease;
}
.corrections__body--open { grid-template-rows: 1fr; }

.corrections__list {
  overflow: hidden;
  list-style: none;
  padding: 0;
  margin: 0;
}

.corrections__item {
  display: flex; align-items: baseline; flex-wrap: wrap; gap: 7px;
  padding: 5px 0;
  font-size: 14px; color: var(--text-secondary);
}
.corrections__item:first-child { padding-top: 10px; }

.corrections__pill {
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

.corrections__text { line-height: 1.5; }
</style>
