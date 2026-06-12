/**
 * shared-weather.js
 * Shared functions for SLU Aviation Dashboard
 * Fetches weather data from a public GitHub Gist (updated by GitHub Actions
 * every 15 minutes from the Aviation Weather Center API).
 * Provides common weather calculations and data validation.
 *
 * This is an ES6 module. Import functions explicitly:
 *   import { fetchWeatherDataFromJSON, isKcpsMetarValid, getEffectiveWeatherData } from './shared-weather.js';
 */

// Constants
// Weather data is served from a public GitHub Gist, which provides permissive CORS headers.
// The Gist is updated by GitHub Actions pulling from the AWC API.
export const WEATHER_DATA_URL = "https://gist.githubusercontent.com/cubap/8559048ba1cac126b5eb03e56309e73f/raw/weather-data.json";
export const METAR_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch pre-parsed weather data from GitHub Gist
 * @returns {Promise<Object|null>} Weather data object or null if fetch fails
 */
export async function fetchWeatherDataFromJSON() {
    try {
        const url = `${WEATHER_DATA_URL}?t=${Date.now()}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Loaded weather data from Gist:", data);

        const validatedData = validateWeatherData(data);
        return validatedData;
    } catch (error) {
        console.error("Could not fetch weather data from Gist:", error);
        return null;
    }
}

/**
 * Check if a METAR timestamp is too old (over 1 hour)
 * @param {string} timestamp - ISO 8601 timestamp string
 * @returns {boolean} True if the METAR is older than 1 hour
 */
export function isMetarTooOld(timestamp) {
    if (!timestamp) return true;
    try {
        const metarTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        const ageMs = currentTime - metarTime;
        if (ageMs > METAR_MAX_AGE_MS) {
            console.warn(`METAR from ${timestamp} is ${Math.round(ageMs / 60000)} minutes old and will be rejected`);
            return true;
        }
        return false;
    } catch {
        console.error(`Failed to parse METAR timestamp: ${timestamp}`);
        return true;
    }
}

/**
 * Extract and validate the embedded METAR time (DDHHMMZ format)
 * @param {string} metarString - Raw METAR string
 * @returns {Date|null} Date object for the METAR time, or null if unparseable
 */
export function getMetarEmbeddedTime(metarString) {
    if (!metarString) return null;

    const match = metarString.match(/(\d{2})(\d{2})(\d{2})Z/);
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const hour = parseInt(match[2], 10);
    const minute = parseInt(match[3], 10);

    if (day < 1 || day > 31 || hour > 23 || minute > 59) return null;

    const now = new Date();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();

    const currentMonthDate = new Date(Date.UTC(currentYear, currentMonth, day, hour, minute, 0));
    const previousMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, day, hour, minute, 0));

    const diffCurrent = Math.abs(currentMonthDate.getTime() - now.getTime());
    const diffPrevious = Math.abs(previousMonthDate.getTime() - now.getTime());

    let metarDate = diffPrevious < diffCurrent ? previousMonthDate : currentMonthDate;

    const hoursDiff = Math.abs(metarDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 48) {
        metarDate = currentMonthDate;
    }

    return metarDate;
}

/**
 * Check if METAR is too old based on embedded timestamp in METAR string
 * @param {string} metarString - Raw METAR string
 * @returns {boolean} True if the embedded METAR time is older than 1 hour
 */
export function isMetarStringTooOld(metarString) {
    const metarTime = getMetarEmbeddedTime(metarString);
    if (!metarTime) return true;

    const currentTime = new Date();
    const ageMs = currentTime.getTime() - metarTime.getTime();

    if (ageMs > METAR_MAX_AGE_MS) {
        console.warn(`METAR "${metarString.substring(0, 40)}..." is ${Math.round(ageMs / 60000)} minutes old and will be rejected`);
        return true;
    }
    return false;
}

/**
 * Validate and clean weather data, rejecting stale KCPS METAR
 * @param {Object} data - Weather data object with kcps and kstl properties
 * @returns {Object} Validated weather data object
 */
export function validateWeatherData(data) {
    if (!data) return data;

    const validateStation = (key) => {
        const station = data[key];
        if (!station || !station?.metar?.trim()) {
            data[key] = { ...station, rejectionReason: "unavailable" };
            return;
        }

        const metarTime = getMetarEmbeddedTime(station.metar);
        if (!metarTime) {
            data[key] = { ...station, rejectionReason: "invalid" };
            return;
        }

        const now = new Date();
        const diffMs = now.getTime() - metarTime.getTime();
        const diffMin = Math.round(diffMs / 60000);

        if (diffMin > 60) {
            data[key] = { ...station, rejectionReason: `stale (${diffMin} min ago)` };
        } else if (diffMin < -120) {
            data[key] = { ...station, rejectionReason: "invalid (future timestamp)" };
        }
    };

    validateStation('kcps');
    validateStation('kstl');

    return data;
}

// ── Calculation helpers ──────────────────────────────────────────────────

/**
 * Calculate relative humidity from temperature and dew point (Celsius)
 * @param {number} T - Temperature in Celsius
 * @param {number} DP - Dew point in Celsius
 * @returns {number|null} Relative humidity as percentage
 */
export function calculateHumidity(T, DP) {
    if (T === null || DP === null) return null;
    const ES = 6.1078 * Math.exp((17.27 * T) / (T + 237.3));
    const E = 6.1078 * Math.exp((17.27 * DP) / (DP + 237.3));
    return (E / ES) * 100;
}

/**
 * Calculate heat index using Steadman's formula
 * @param {number} tempF - Temperature in Fahrenheit
 * @param {number} rh - Relative humidity as percentage
 * @returns {number|null} Heat index in Fahrenheit
 */
export function calculateHeatIndex(tempF, rh) {
    if (tempF < 80) return tempF;
    if (rh === null) return null;
    const HI = -42.379 + (2.04901523 * tempF) + (10.14333127 * rh) - (0.22475541 * tempF * rh) -
        (0.00683783 * tempF * tempF) - (0.05481717 * rh * rh) +
        (0.00122874 * tempF * tempF * rh) + (0.00085282 * tempF * rh * rh) -
        (0.00000199 * tempF * tempF * rh * rh);
    return HI;
}

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number|null} Temperature in Fahrenheit
 */
export function toFahrenheit(celsius) {
    if (celsius === null) return null;
    return (celsius * 9 / 5) + 32;
}

/**
 * Convert miles per hour to knots
 * @param {number} mph - Speed in miles per hour
 * @returns {number|null} Speed in knots
 */
export function toKnots(mph) {
    if (mph === null) return null;
    return mph * 0.868976;
}

/**
 * Convert knots to miles per hour
 * @param {number} knots - Speed in knots
 * @returns {number|null} Speed in miles per hour
 */
export function toMPH(knots) {
    if (knots === null) return null;
    return knots / 0.868976;
}

/**
 * Get effective wind speed for calculations/restrictions.
 * @param {number|null|undefined} windSpeed - Steady-state wind in knots
 * @param {number|null|undefined} windGust - Wind gust in knots
 * @returns {number|null} Effective wind speed in knots or null if unavailable
 */
export function getEffectiveWindSpeed(windSpeed, windGust) {
    const hasGust = (windGust ?? 0) > 0;
    const hasSpeed = windSpeed != null;
    if (!hasGust && !hasSpeed) return null;
    if (hasGust && (!hasSpeed || windGust > windSpeed)) return windGust;
    return windSpeed;
}

/**
 * Calculate crosswind component
 * @param {number} windDirection - Wind direction in degrees
 * @param {number} windSpeed - Wind speed in knots
 * @param {number} runwayHeading - Runway heading in degrees
 * @param {number} windGust - Wind gust in knots (optional)
 * @returns {number|null} Crosswind component in knots
 */
export function calculateCrosswind(windDirection, windSpeed, runwayHeading, windGust = null) {
    if (windDirection == null) return null;
    const effectiveWindSpeed = getEffectiveWindSpeed(windSpeed, windGust);
    if (effectiveWindSpeed == null) return null;
    const angleDiff = Math.abs(windDirection - runwayHeading);
    const effectiveAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff;
    return effectiveWindSpeed * Math.sin(effectiveAngle * Math.PI / 180);
}

// ── Shared ceiling helpers ───────────────────────────────────────────────
export const CEILING_RESTRICTION_AGL_FT = 1500;

/**
 * Get ceiling in AGL format
 * @param {number|null|undefined} cloudCeilingAGL - Cloud ceiling AGL (ft) or 99999 for clear
 * @returns {number|null} Ceiling AGL in feet, or null if no ceiling
 */
export function getCeilingAGL(cloudCeilingAGL) {
    if (cloudCeilingAGL === undefined || cloudCeilingAGL === null) return null;
    if (cloudCeilingAGL >= 99999) return null;
    return cloudCeilingAGL;
}

/**
 * Determine if ceiling imposes restrictions given a threshold
 * @param {number|null|undefined} cloudCeilingAGL - Cloud ceiling AGL (ft)
 * @param {number} thresholdFtAGL - Threshold in feet AGL
 * @returns {boolean} True if restricted
 */
export function isCeilingRestricted(cloudCeilingAGL, thresholdFtAGL = CEILING_RESTRICTION_AGL_FT) {
    const agl = getCeilingAGL(cloudCeilingAGL);
    return agl !== null && agl < thresholdFtAGL;
}

// ── Shared visibility helpers ────────────────────────────────────────────
export const VISIBILITY_RESTRICTION_SM = 3;

/**
 * Determine if visibility imposes restrictions
 * @param {number|null|undefined} visibilitySM - Visibility in statute miles
 * @param {number} thresholdSM - Threshold in SM
 * @returns {boolean} True if restricted
 */
export function isVisibilityRestricted(visibilitySM, thresholdSM = VISIBILITY_RESTRICTION_SM) {
    return visibilitySM != null && visibilitySM < thresholdSM;
}

// ── Shared validation helpers ────────────────────────────────────────────
/**
 * Check if KCPS METAR is valid and available
 * @param {Object} data - Weather data object
 * @returns {boolean} True if KCPS METAR is valid
 */
export function isKcpsMetarValid(data) {
    if (!data?.kcps) return false;
    const metar = data.kcps.metar;
    return !!(metar && metar.trim().replace(/\0/g, '').length > 0 && !data.kcps.rejectionReason);
}

/**
 * Check if KSTL METAR is valid and available
 * @param {Object} data - Weather data object
 * @returns {boolean} True if KSTL METAR is valid
 */
export function isKstlMetarValid(data) {
    if (!data?.kstl) return false;
    const metar = data.kstl.metar;
    return !!(metar && metar.trim().replace(/\0/g, '').length > 0 && !data.kstl.rejectionReason);
}

/**
 * Get effective weather data (KCPS if valid, otherwise KSTL)
 * @param {Object} data - Weather data object
 * @returns {Object|null} Effective weather data or null if neither station is valid
 */
export function getEffectiveWeatherData(data) {
    if (!data) return null;
    if (isKcpsMetarValid(data)) return data.kcps;
    if (isKstlMetarValid(data)) return data.kstl;
    return null;
}

// ── Shared time formatting helpers ──────────────────────────────────────
/**
 * Get METAR age text (e.g., "(12 min ago)", "(2 hrs ago)")
 * @param {string} timestamp - ISO 8601 timestamp string
 * @returns {string} Formatted time ago string
 */
export function getMinutesAgo(timestamp) {
    if (!timestamp) return '';
    
    const metarTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - metarTime) / (1000 * 60));
    
    if (diffMinutes < 1) return '(< 1 min ago)';
    if (diffMinutes < 60) return `(${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago)`;
    
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    
    if (hours === 1 && mins === 0) return '(1 hr ago)';
    if (mins === 0) return `(${hours} hrs ago)`;
    
    if (hours >= 24) {
        const dateStr = metarTime.toISOString().slice(0, 10);
        const timeStr = metarTime.toISOString().slice(11, 16);
        return `(Stale: ${dateStr} ${timeStr}Z)`;
    }
    
    return `(${hours} hr${hours > 1 ? 's' : ''} ${mins} min${mins > 1 ? 's' : ''} ago)`;
}

/**
 * Format update time display
 * @param {Date|Object|null} timeData - Date object, timestamp string, or null
 * @param {string} format - 'full' (default) or 'time-only'
 * @returns {string} Formatted time string
 */
export function formatUpdateTime(timeData, format = 'full') {
    if (!timeData) return 'N/A';
    
    const date = timeData instanceof Date ? timeData : new Date(timeData);
    if (isNaN(date.getTime())) return 'N/A';
    
    if (format === 'time-only') {
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
