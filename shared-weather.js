/**
 * shared-weather.js
 * Shared functions for SLU Aviation Dashboard
 * Contains common weather calculations and data fetching logic
 */

// Constants
const WEATHER_DATA_URL = "https://raw.githubusercontent.com/CenterForDigitalHumanities/aviation-dashboard/weather-data/data/weather-data.json";
const METAR_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if a METAR timestamp is too old (over 1 hour)
 * @param {string} timestamp - ISO 8601 timestamp string (e.g., "2026-01-06T17:53:00+00:00")
 * @returns {boolean} True if the METAR is older than 1 hour
 */
function isMetarTooOld(timestamp) {
    if (!timestamp) return true; // Missing timestamp = too old
    try {
        const metarTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const agems = currentTime - metarTime;
        if (agems > METAR_MAX_AGE_MS) {
            console.warn(`METAR from ${timestamp} is ${Math.round(agems / 60000)} minutes old and will be rejected`);
            return true;
        }
        return false;
    } catch {
        console.error(`Failed to parse METAR timestamp: ${timestamp}`);
        return true; // Unparseable = too old
    }
}

/**
 * Extract and validate the embedded METAR time (DDHHMMZ format)
 * Returns the actual UTC time the METAR was issued
 * @param {string} metarString - Raw METAR string (e.g., "KCPS 280953Z AUTO...")
 * @returns {Date|null} Date object for the METAR time, or null if unparseable
 */
function getMetarEmbeddedTime(metarString) {
    if (!metarString) return null;
    
    // Extract DDHHMMZ pattern (e.g., "280953Z")
    const match = metarString.match(/(\d{2})(\d{2})(\d{2})Z/);
    if (!match) return null;
    
    const day = parseInt(match[1], 10);
    const hour = parseInt(match[2], 10);
    const minute = parseInt(match[3], 10);
    
    if (day < 1 || day > 31 || hour > 23 || minute > 59) return null;
    
    // Build date: use current month/year, but handle day rollovers
    const now = new Date();
    let metarDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day, hour, minute, 0));
    
    // If the METAR day is in the future, it's from the previous month
    if (metarDate.getTime() > now.getTime()) {
        metarDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, day, hour, minute, 0));
    }
    
    return metarDate;
}

/**
 * Check if METAR is too old based on embedded timestamp in METAR string
 * @param {string} metarString - Raw METAR string
 * @returns {boolean} True if the embedded METAR time is older than 1 hour
 */
function isMetarStringTooOld(metarString) {
    const metarTime = getMetarEmbeddedTime(metarString);
    if (!metarTime) return true; // Unparseable = too old
    
    const currentTime = new Date();
    const agems = currentTime.getTime() - metarTime.getTime();
    
    if (agems > METAR_MAX_AGE_MS) {
        console.warn(`METAR "${metarString.substring(0, 40)}..." is ${Math.round(agems / 60000)} minutes old and will be rejected`);
        return true;
    }
    return false;
}

/**
 * Validate and clean weather data, rejecting stale KCPS METAR
 * If KCPS METAR is over 1 hour old (based on embedded timestamp), 
 * all KCPS data is cleared to trigger fallback to KSTL
 * @param {Object} data - Weather data object with kcps and kstl properties
 * @returns {Object} Validated weather data object
 */
function validateWeatherData(data) {
    if (!data) return data;
    
    // Check KCPS METAR age based on embedded timestamp in METAR string
    if (data.kcps && data.kcps.metar && isMetarStringTooOld(data.kcps.metar)) {
        console.warn("KCPS data is stale (METAR older than 1 hour); rejecting all KCPS data in favor of KSTL fallback");
        // Clear all KCPS data to force fallback to KSTL
        data.kcps = {
            metar: "",
            windDirection: null,
            windSpeed: null,
            windGust: null,
            visibility: null,
            temperatureC: null,
            dewPointC: null,
            cloudCeiling: null,
            altimeter: null,
            timestamp: null,
            station: "KCPS"
        };
    }
    
    return data;
}

/**
 * Fetch pre-parsed weather data from GitHub Actions generated JSON file
 * @returns {Promise<Object|null>} Weather data object or null if fetch fails
 */
async function fetchWeatherDataFromJSON() {
    try {
        const response = await fetch(WEATHER_DATA_URL, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                Pragma: 'no-cache',
                Expires: '0'
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log("Loaded weather data from JSON:", data)
        
        // Validate data and reject stale METAR
        const validatedData = validateWeatherData(data)
        
        return validatedData
    } catch (error) {
        console.error(`Could not fetch weather data from JSON:`, error)
        return null
    }
}

/**
 * Calculate relative humidity from temperature and dew point (Celsius)
 * Source: https://www.wpc.ncep.noaa.gov/html/temp2humid.shtml (simplified)
 * @param {number} T - Temperature in Celsius
 * @param {number} DP - Dew point in Celsius
 * @returns {number|null} Relative humidity as percentage
 */
function calculateHumidity(T, DP) {
    if (T === null || DP === null) return null
    const ES = 6.1078 * Math.exp((17.27 * T) / (T + 237.3))
    const E = 6.1078 * Math.exp((17.27 * DP) / (DP + 237.3))
    return (E / ES) * 100
}

/**
 * Calculate heat index using Steadman's formula
 * Source: https://www.wpc.ncep.noaa.gov/html/heatindex_formula.shtml
 * @param {number} tempF - Temperature in Fahrenheit
 * @param {number} rh - Relative humidity as percentage
 * @returns {number|null} Heat index in Fahrenheit
 */
function calculateHeatIndex(tempF, rh) {
    if (tempF < 80) return tempF // Heat index is same as temperature below 80F
    if (rh === null) return null

    const HI = -42.379 + (2.04901523 * tempF) + (10.14333127 * rh) - (0.22475541 * tempF * rh) -
               (0.00683783 * tempF * tempF) - (0.05481717 * rh * rh) +
               (0.00122874 * tempF * tempF * rh) + (0.00085282 * tempF * rh * rh) -
               (0.00000199 * tempF * tempF * rh * rh)
    return HI
}

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number|null} Temperature in Fahrenheit
 */
function toFahrenheit(celsius) {
    if (celsius === null) return null
    return (celsius * 9/5) + 32
}

/**
 * Convert miles per hour to knots
 * @param {number} mph - Speed in miles per hour
 * @returns {number|null} Speed in knots
 */
function toKnots(mph) {
    if (mph === null) return null
    return mph * 0.868976
}

/**
 * Convert knots to miles per hour
 * @param {number} knots - Speed in knots
 * @returns {number|null} Speed in miles per hour
 */
function toMPH(knots) {
    if (knots === null) return null
    return knots / 0.868976
}

/**
 * Get effective wind speed for calculations/restrictions.
 * Uses gust if present and greater than steady wind; otherwise uses steady wind.
 * @param {number|null|undefined} windSpeed - Steady-state wind in knots
 * @param {number|null|undefined} windGust - Wind gust in knots
 * @returns {number|null} Effective wind speed in knots or null if unavailable
 */
function getEffectiveWindSpeed(windSpeed, windGust) {
    const hasGust = (windGust ?? 0) > 0
    const hasSpeed = windSpeed != null // allow 0 as valid speed
    if (!hasGust && !hasSpeed) return null
    if (hasGust && (!hasSpeed || windGust > windSpeed)) return windGust
    return windSpeed
}

/**
 * Calculate crosswind component
 * @param {number} windDirection - Wind direction in degrees
 * @param {number} windSpeed - Wind speed in knots
 * @param {number} runwayHeading - Runway heading in degrees
 * @param {number} windGust - Wind gust in knots (optional)
 * @returns {number|null} Crosswind component in knots
 */
function calculateCrosswind(windDirection, windSpeed, runwayHeading, windGust = null) {
    if (windDirection == null) return null
    const effectiveWindSpeed = getEffectiveWindSpeed(windSpeed, windGust)
    if (effectiveWindSpeed == null) return null
    const angleDiff = Math.abs(windDirection - runwayHeading)
    const effectiveAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff // Smallest angle
    return effectiveWindSpeed * Math.sin(effectiveAngle * Math.PI / 180)
}

// --- Shared ceiling helpers (extracted to reduce duplication) ---
// Unified restriction threshold for ceiling (AGL, feet)
const CEILING_RESTRICTION_AGL_FT = 1500

/**
 * Get ceiling in AGL format
 * Note: METAR cloud ceilings are already reported in AGL (Above Ground Level), not MSL
 * @param {number|null|undefined} cloudCeilingAGL - Cloud ceiling AGL (ft) or 99999 for clear
 * @returns {number|null} Ceiling AGL in feet, or null if no ceiling
 */
function getCeilingAGL(cloudCeilingAGL) {
    if (cloudCeilingAGL === undefined || cloudCeilingAGL === null) return null
    if (cloudCeilingAGL >= 99999) return null // Clear/No ceiling
    return cloudCeilingAGL
}

/**
 * Determine if ceiling imposes restrictions given a threshold
 * Note: METAR cloud ceilings are already in AGL, no elevation adjustment needed
 * @param {number|null|undefined} cloudCeilingAGL - Cloud ceiling AGL (ft)
 * @param {number} [thresholdFtAGL=CEILING_RESTRICTION_AGL_FT] - Threshold in feet AGL
 * @returns {boolean} True if restricted
 */
function isCeilingRestricted(cloudCeilingAGL, thresholdFtAGL = CEILING_RESTRICTION_AGL_FT) {
    const agl = getCeilingAGL(cloudCeilingAGL)
    return agl !== null && agl < thresholdFtAGL
}

// Expose helpers to global scope for inline <script> usage
window.CEILING_RESTRICTION_AGL_FT = CEILING_RESTRICTION_AGL_FT
window.getCeilingAGL = getCeilingAGL
window.isCeilingRestricted = isCeilingRestricted

// --- Shared visibility helpers ---
// Unified visibility restriction threshold (statute miles)
const VISIBILITY_RESTRICTION_SM = 3

/**
 * Determine if visibility imposes restrictions
 * @param {number|null|undefined} visibilitySM - Visibility in statute miles
 * @param {number} [thresholdSM=VISIBILITY_RESTRICTION_SM] - Threshold in SM
 * @returns {boolean} True if restricted
 */
function isVisibilityRestricted(visibilitySM, thresholdSM = VISIBILITY_RESTRICTION_SM) {
    return visibilitySM != null && visibilitySM < thresholdSM
}

// Expose to global
window.VISIBILITY_RESTRICTION_SM = VISIBILITY_RESTRICTION_SM
window.isVisibilityRestricted = isVisibilityRestricted
