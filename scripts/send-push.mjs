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

const KCPS_RUNWAY_12_HDG = 122
const KCPS_RUNWAY_30_HDG = 302

function calcHumidity(tC, tdC) {
    if (tC == null || tdC == null) return null
    const eS = 6.1078 * Math.pow(10, (7.5 * tC)  / (237.3 + tC))
    const eA = 6.1078 * Math.pow(10, (7.5 * tdC) / (237.3 + tdC))
    return Math.min(100, (eA / eS) * 100)
}

function calculateHeatIndex(tempF, rh) {
    if (tempF < 80) return tempF
    if (rh == null) return null
    return -42.379 + (2.04901523 * tempF) + (10.14333127 * rh) - (0.22475541 * tempF * rh) -
           (0.00683783 * tempF * tempF) - (0.05481717 * rh * rh) +
           (0.00122874 * tempF * tempF * rh) + (0.00085282 * tempF * rh * rh) -
           (0.00000199 * tempF * tempF * rh * rh)
}

function getEffectiveWindSpeed(windSpeed, windGust) {
    const hasGust = (windGust ?? 0) > 0
    const hasSpeed = windSpeed != null
    if (!hasGust && !hasSpeed) return null
    if (hasGust && (!hasSpeed || windGust > windSpeed)) return windGust
    return windSpeed
}

function calculateCrosswind(windDirection, windSpeed, runwayHeading, windGust = null) {
    if (windDirection == null) return null
    const effectiveWindSpeed = getEffectiveWindSpeed(windSpeed, windGust)
    if (effectiveWindSpeed == null) return null
    const angleDiff = Math.abs(windDirection - runwayHeading)
    const effectiveAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff
    return effectiveWindSpeed * Math.sin(effectiveAngle * Math.PI / 180)
}

function isCeilingRestricted(cloudCeilingAGL, thresholdFtAGL = 1500) {
    if (cloudCeilingAGL == null) return false
    if (cloudCeilingAGL >= 99999) return false
    return cloudCeilingAGL < thresholdFtAGL
}

function isVisibilityRestricted(visibilitySM, thresholdSM = 3) {
    return visibilitySM != null && visibilitySM < thresholdSM
}

// ── Category logic aligned with mobile/dashboard restrictions ─────────────────
function calcCategory(d) {
    const tempF = d.temperatureC != null ? d.temperatureC * 9 / 5 + 32 : null
    const humidity = calcHumidity(d.temperatureC, d.dewPointC)
    const hi = (tempF != null && humidity != null)
        ? calculateHeatIndex(tempF, humidity)
        : (tempF ?? 70)

    const ew = getEffectiveWindSpeed(d.windSpeed, d.windGust) ?? 0
    const cw12 = d.windDirection != null
        ? Math.abs(calculateCrosswind(d.windDirection, d.windSpeed, KCPS_RUNWAY_12_HDG, d.windGust))
        : 0
    const cw30 = d.windDirection != null
        ? Math.abs(calculateCrosswind(d.windDirection, d.windSpeed, KCPS_RUNWAY_30_HDG, d.windGust))
        : 0
    const maxCW = Math.max(cw12, cw30)

    let tempCat = 'a'
    if (tempF != null) {
        if (tempF <= 14) tempCat = 'd'
        else if (tempF <= 23) tempCat = 'c'
    }
    if (hi >= 105) tempCat = 'd'
    else if (hi >= 100 && tempCat !== 'd') tempCat = 'd'
    else if (hi >= 95 && tempCat === 'a') tempCat = 'c'

    let wxCat = 'a'
    if (ew >= 30 || maxCW > 20 || isCeilingRestricted(d.cloudCeiling) || isVisibilityRestricted(d.visibility)) wxCat = 'd'
    else if (ew >= 25 || maxCW > 15) wxCat = 'c'
    else if (ew >= 20 || maxCW > 10) wxCat = 'b'

    const order = ['a', 'b', 'c', 'd', 'f']
    return order[Math.max(order.indexOf(wxCat), order.indexOf(tempCat))]
}

const category = calcCategory(d)
const catLabels = {
    a: 'No solo restrictions in effect.',
    b: 'Student pilot solos restricted.',
    c: 'Private pilot solos restricted.',
    d: 'Instrument/Commercial solos restricted.',
    f: 'No flights. See airport announcements for details.'
}
const details = catLabels[category] ?? 'Flight status updated.'
const payload = JSON.stringify({ category, details, station })
console.log(`Category ${category.toUpperCase()} — ${details} (${station})`)

// ── Fetch subscriptions from Supabase REST API ───────────────────────────────
const authHeaders = {
    apikey:        SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
}
const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, { headers: authHeaders })
if (!res.ok) {
    const body = await res.text()
    console.error(`Supabase subscription query failed (${res.status} ${res.statusText})`)
    console.error(body.slice(0, 500))
    if (res.status === 401 || res.status === 403)
        console.error('Check SUPABASE_SERVICE_ROLE_KEY secret and RLS policies.')
    process.exit(1)
}

let subs = []
try {
    subs = await res.json()
} catch (err) {
    console.error('Failed to parse Supabase response JSON:', err)
    process.exit(1)
}

if (!Array.isArray(subs) || !subs.length) {
    console.log('No subscribers — push skipped.')
    process.exit(0)
}
console.log(`Sending to ${subs.length} subscriber(s)…`)

// ── Push to each subscriber, collect expired endpoints ──────────────────────
const expired = []
let sentCount = 0
let failedCount = 0
await Promise.allSettled(subs.map(async row => {
    try {
        await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            payload,
        )
        sentCount += 1
    } catch (err) {
        failedCount += 1
        console.warn(`  Failed (${err.statusCode}) for …${row.endpoint.slice(-30)}`)
        if (err.statusCode === 410 || err.statusCode === 404) expired.push(row.endpoint)
    }
}))
console.log(`Push delivery summary: sent=${sentCount}, failed=${failedCount}, expired=${expired.length}`)

// ── Remove subscriptions the browser has revoked ────────────────────────────
for (const ep of expired) {
    const delRes = await fetch(
        `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(ep)}`,
        { method: 'DELETE', headers: authHeaders },
    )
    if (!delRes.ok) {
        const body = await delRes.text()
        console.warn(`Failed removing expired subscription (${delRes.status} ${delRes.statusText})`)
        console.warn(body.slice(0, 300))
    }
}
if (expired.length) console.log(`Removed ${expired.length} expired subscription(s).`)

console.log('Done.')
