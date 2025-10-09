// fetch-weather.js
// This script fetches METAR data from NOAA and parses it into JSON format
// Run this in a separate GitHub repository with GitHub Actions

const fetch = require('node-fetch');
const fs = require('fs');

const KCPS_URL = 'https://tgftp.nws.noaa.gov/data/observations/metar/stations/KCPS.TXT';
const KSTL_URL = 'https://tgftp.nws.noaa.gov/data/observations/metar/stations/KSTL.TXT';

async function fetchMetar(url) {
    try {
        console.log(`Fetching METAR from ${url}...`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        // Get the last line which contains the METAR
        const metar = text.trim().split('\n').pop();
        console.log(`Successfully fetched: ${metar}`);
        return metar;
    } catch (error) {
        console.error(`Error fetching METAR from ${url}:`, error);
        return null;
    }
}

function parseMetar(metarText) {
    if (!metarText) return null;

    const data = {
        metar: metarText,
        windDirection: null,
        windSpeed: null,
        windGust: null,
        visibility: null,
        temperatureC: null,
        dewPointC: null,
        cloudCeiling: null,
        altimeter: null,
        timestamp: null
    };

    // Extract station
    const stationMatch = metarText.match(/^([A-Z]{4})\s/);
    if (stationMatch) {
        data.station = stationMatch[1];
    }

    // Extract observation time (UTC)
    const timeMatch = metarText.match(/(\d{6}Z)/);
    if (timeMatch) {
        const day = parseInt(timeMatch[1].substring(0, 2));
        const hour = parseInt(timeMatch[1].substring(2, 4));
        const minute = parseInt(timeMatch[1].substring(4, 6));
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = now.getUTCMonth();
        const metarDate = new Date(Date.UTC(year, month, day, hour, minute));
        data.timestamp = metarDate.toISOString();
    }

    // Wind
    const windMatch = metarText.match(/(\d{3})(\d{2,3})(G(\d{2,3}))?KT/);
    if (windMatch) {
        data.windDirection = parseInt(windMatch[1]);
        data.windSpeed = parseInt(windMatch[2]);
        data.windGust = windMatch[4] ? parseInt(windMatch[4]) : null;
    } else {
        // Check for calm winds
        const calmWindMatch = metarText.match(/00000KT/);
        if (calmWindMatch) {
            data.windDirection = 0;
            data.windSpeed = 0;
            data.windGust = null;
        }
    }

    // Visibility
    const visMatch = metarText.match(/(\d{1,2})SM|(M?\d\/\d)SM|(CAVOK)|(P6SM)/);
    if (visMatch) {
        if (visMatch[1]) {
            data.visibility = parseInt(visMatch[1]);
        } else if (visMatch[2]) {
            const fraction = visMatch[2].replace('M', '');
            const [num, den] = fraction.split('/').map(Number);
            data.visibility = num / den;
        } else if (visMatch[3] === 'CAVOK') {
            data.visibility = 10;
            data.cloudCeiling = 99999;
        } else if (visMatch[4]) {
            data.visibility = 6; // P6SM means greater than 6
        }
    }

    // Temperature and Dew Point
    const tempDewMatch = metarText.match(/\s(M?\d{2})\/(M?\d{2})\s/);
    if (tempDewMatch) {
        data.temperatureC = parseInt(tempDewMatch[1].replace('M', '-'));
        data.dewPointC = parseInt(tempDewMatch[2].replace('M', '-'));
    }

    // Clouds (ceiling defined as lowest broken or overcast layer)
    const cloudMatches = metarText.match(/(BKN|OVC|VV)(\d{3})/g);
    if (cloudMatches) {
        let lowestCeiling = Infinity;
        cloudMatches.forEach(cloudLayer => {
            const height = parseInt(cloudLayer.substring(3)) * 100;
            if (cloudLayer.startsWith('BKN') || cloudLayer.startsWith('OVC') || cloudLayer.startsWith('VV')) {
                if (height < lowestCeiling) {
                    lowestCeiling = height;
                }
            }
        });
        if (lowestCeiling !== Infinity) {
            data.cloudCeiling = lowestCeiling;
        }
    } else {
        // Check for clear skies
        const clrMatch = metarText.match(/\s(CLR|SKC)\s/);
        if (clrMatch) {
            data.cloudCeiling = 99999;
        }
    }

    // Altimeter
    const altimeterMatch = metarText.match(/A(\d{4})/);
    if (altimeterMatch) {
        data.altimeter = 'A' + altimeterMatch[1];
    }

    return data;
}

async function main() {
    console.log('Starting weather data fetch...');
    console.log(`Timestamp: ${new Date().toISOString()}`);

    // Fetch both METARs
    const kcpsMetar = await fetchMetar(KCPS_URL);
    const kstlMetar = await fetchMetar(KSTL_URL);

    // Parse METARs
    const kcpsData = parseMetar(kcpsMetar);
    const kstlData = parseMetar(kstlMetar);

    // Create output data structure
    const outputData = {
        lastUpdated: new Date().toISOString(),
        kcps: kcpsData || {
            station: 'KCPS',
            metar: 'Data unavailable',
            error: 'Failed to fetch METAR'
        },
        kstl: kstlData || {
            station: 'KSTL',
            metar: 'Data unavailable',
            error: 'Failed to fetch METAR'
        }
    };

    // Write to file
    const jsonOutput = JSON.stringify(outputData, null, 2);
    fs.writeFileSync('weather-data.json', jsonOutput);
    
    console.log('Weather data written to weather-data.json');
    console.log(jsonOutput);
    
    return outputData;
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
