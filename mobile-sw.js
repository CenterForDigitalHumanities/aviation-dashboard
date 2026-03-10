// mobile-sw.js — Service Worker for SLU Aviation mobile page
//
// Primary purpose: maintain a persistent system notification showing the
// current KCPS flight category. The page posts a message each time it
// refreshes weather (every 5 min). The SW shows a notification with a
// fixed tag so it replaces the previous one silently.
//
// Note: this is client-initiated notification (via postMessage), not
// server-push WebPush, because the site is a static GitHub Pages deployment
// with no push endpoint. The trade-off: the notification updates only while
// at least one tab/PWA window is open, but persists in the system
// notification shade indefinitely after that until dismissed.

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
