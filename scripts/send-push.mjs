/**
 * send-push.mjs
 * Send Web Push notifications to all subscribers after weather data updates.
 * Called by GitHub Actions after a new weather-data.json has been written.
 *
 * Requires: npm install --no-save web-push
 * Secrets:  VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
 *           SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import webpush from 'web-push'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Gracefully skip if secrets aren't configured yet
const REQUIRED_ENV = [
    'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT',
    'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
]
const missing = REQUIRED_ENV.filter(k => !process.env[k])
if (missing.length) {
    console.log(`Web Push not configured (missing secrets: ${missing.join(', ')}). Skipping.`)
    process.exit(0)
}

const {
    VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT,
    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
} = process.env

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

// ── Load weather data ────────────────────────────────────────────────────────
const dataPath = join(__dirname, '..', 'data', 'weather-data.json')
const weather  = JSON.parse(readFileSync(dataPath, 'utf8'))

let d       = weather.kcps ?? {}
let station = 'KCPS'
if (d.windSpeed == null && d.visibility == null) {
    d       = weather.kstl ?? {}
    station = 'KSTL'
}

// ── Simplified A–D category logic (mirrors shared-weather.js thresholds) ─────
function calcCategory(d) {
    const ceil    = d.cloudCeiling ?? null
    const vis     = d.visibility   ?? null
    const ws      = Math.max(d.windSpeed ?? 0, d.windGust ?? 0)
    const ceilStr = ceil != null ? `${ceil} ft`        : 'CLR'
    const visStr  = vis  != null ? `${vis} SM`         : '–'

    if ((ceil != null && ceil < 500)  || (vis != null && vis < 1))
        return ['d', `LIFR · Ceil ${ceilStr} · Vis ${visStr}`]
    if ((ceil != null && ceil < 1000) || (vis != null && vis < 3))
        return ['c', `IFR · Ceil ${ceilStr} · Vis ${visStr}`]
    if ((ceil != null && ceil < 3000) || (vis != null && vis < 5) || ws > 15)
        return ['b', `MVFR · Ceil ${ceilStr} · Vis ${visStr}`]
    return ['a', `VFR · Vis ${visStr} · Wind ${Math.round(ws)} kt`]
}

const [category, details] = calcCategory(d)
const payload = JSON.stringify({ category, details, station })
console.log(`Category ${category.toUpperCase()} — ${details} (${station})`)

// ── Fetch subscriptions from Supabase REST API ───────────────────────────────
const authHeaders = {
    apikey:        SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
}
const res  = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, { headers: authHeaders })
const subs = await res.json()

if (!Array.isArray(subs) || !subs.length) {
    console.log('No subscribers — push skipped.')
    process.exit(0)
}
console.log(`Sending to ${subs.length} subscriber(s)…`)

// ── Push to each subscriber, collect expired endpoints ──────────────────────
const expired = []
await Promise.allSettled(subs.map(async row => {
    try {
        await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            payload,
        )
    } catch (err) {
        console.warn(`  Failed (${err.statusCode}) for …${row.endpoint.slice(-30)}`)
        if (err.statusCode === 410 || err.statusCode === 404) expired.push(row.endpoint)
    }
}))

// ── Remove subscriptions the browser has revoked ────────────────────────────
for (const ep of expired) {
    await fetch(
        `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(ep)}`,
        { method: 'DELETE', headers: authHeaders },
    )
}
if (expired.length) console.log(`Removed ${expired.length} expired subscription(s).`)

console.log('Done.')
