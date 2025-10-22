/**
 * shared-weather.js
 * Shared functions for SLU Aviation Dashboard
 * Contains common weather calculations and data fetching logic
 */

// Constants
const WEATHER_DATA_URL = "data/weather-data.json";

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
        return data
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
 * Calculate crosswind component
 * @param {number} windDirection - Wind direction in degrees
 * @param {number} windSpeed - Wind speed in knots
 * @param {number} runwayHeading - Runway heading in degrees
 * @param {number} windGust - Wind gust in knots (optional)
 * @returns {number|null} Crosswind component in knots
 */
function calculateCrosswind(windDirection, windSpeed, runwayHeading, windGust = null) {
    if (windDirection === null || windSpeed === null) return null
    // Use gust value if present and greater than zero, otherwise use steady-state wind
    const effectiveWindSpeed = (windGust !== null && windGust > 0) ? windGust : windSpeed
    const angleDiff = Math.abs(windDirection - runwayHeading)
    const effectiveAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff // Smallest angle
    return effectiveWindSpeed * Math.sin(effectiveAngle * Math.PI / 180)
}
