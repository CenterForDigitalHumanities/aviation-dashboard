// mobile-sw.js — Service Worker for SLU Aviation mobile page
//
// Primary purpose: maintain a persistent system notification showing the
// current KCPS flight category. The page posts a message each time it
// refreshes weather (every 5 min). The SW shows a notification with a
// fixed tag so it replaces the previous one silently.
//
// Handles two notification sources:
//  1. postMessage (client-initiated) — updates the persistent status notification
//     while at least one tab is open.
//  2. Web Push (server-initiated) — delivers background notifications from
//     GitHub Actions when weather data changes, even when no tab is open.

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

// ── Persistent notification ──────────────────────────────────────────────
self.addEventListener('message', e => {
    if (e.data?.type !== 'NOTIFY') return

    const { category = 'A', details = '', station = 'KCPS' } = e.data
    const icons = { a: '🟢', b: '🟡', c: '🟠', d: '🔴', f: '⛔' }
    const emoji = icons[String(category).toLowerCase()] ?? '✈️'

    e.waitUntil(
        self.registration.showNotification(
            `${emoji} Category ${String(category).toUpperCase()} — ${station}`,
            {
                body: details,
                // Same tag replaces the previous notification without re-alerting
                tag: 'kcps-flight-status',
                renotify: false,
                silent: true,
                icon: '/assets/favicon.svg',
                badge: '/assets/favicon.svg',
                data: { url: self.registration.scope + 'mobile.html' }
            }
        )
    )
})

// ── Web Push delivery (server-initiated from GitHub Actions) ─────────────────
self.addEventListener('push', e => {
    if (!e.data) return
    const { category = 'A', details = '', station = 'KCPS' } = e.data.json()
    const icons = { a: '🟢', b: '🟡', c: '🟠', d: '🔴', f: '⛔' }
    const emoji = icons[String(category).toLowerCase()] ?? '✈️'

    e.waitUntil(
        self.registration.showNotification(
            `${emoji} Category ${String(category).toUpperCase()} — ${station}`,
            {
                body: details,
                tag: 'kcps-flight-status',
                renotify: true,   // Alert the user — this is genuinely new data
                silent: false,
                icon: '/assets/favicon.svg',
                badge: '/assets/favicon.svg',
                data: { url: self.registration.scope + 'mobile.html' }
            }
        )
    )
})

// ── Tap notification → open / focus mobile page ──────────────────────────
self.addEventListener('notificationclick', e => {
    e.notification.close()
    const target = e.notification.data?.url ?? (self.registration.scope + 'mobile.html')
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            const existing = list.find(c => c.url.includes('mobile'))
            return existing ? existing.focus() : clients.openWindow(target)
        })
    )
})
