const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

export default defineNitroPlugin((nitro) => {
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_CRON) {
    console.log('[cron] Skipped in dev (set ENABLE_CRON=1 to enable)')
    return
  }

  const poll = async () => {
    try {
      const res = await $fetch('/api/generate', { method: 'POST' })
      const { generated } = res as any
      if (generated > 0) {
        console.log(`[cron] ${generated} release note(s) generee(s)`)
      }
    }
    catch (err: any) {
      console.error('[cron] Erreur generation:', err.message)
    }
  }

  let interval: ReturnType<typeof setInterval>

  nitro.hooks.hook('request', () => {
    if (!interval) {
      interval = setInterval(poll, POLL_INTERVAL)
      // Premier check 10s apres le boot
      setTimeout(poll, 10_000)
      console.log(`[cron] Poll actif toutes les ${POLL_INTERVAL / 1000}s`)
    }
  })

  nitro.hooks.hook('close', () => {
    if (interval) clearInterval(interval)
  })
})
