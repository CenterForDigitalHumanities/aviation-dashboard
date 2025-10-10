#!/usr/bin/env python3
"""
fetch-weather.py
Fetches METAR data from NOAA and parses it into JSON format
"""

import json
import re
from datetime import datetime, timezone, timedelta
from urllib.request import urlopen, Request
from urllib.error import URLError

KCPS_URL = 'https://tgftp.nws.noaa.gov/data/observations/metar/stations/KCPS.TXT'
KSTL_URL = 'https://tgftp.nws.noaa.gov/data/observations/metar/stations/KSTL.TXT'

def fetch_metar(url, retry_on_stale=True):
    """Fetch METAR data from NOAA
    
    Args:
        url: URL to fetch METAR from
        retry_on_stale: If True, retry once if data is older than 30 minutes
    
    Returns:
        METAR text string or None if failed
    """
    try:
        print(f"Fetching METAR from {url}...")
        
        # Create a request with cache-busting headers
        request = Request(url)
        request.add_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        request.add_header('Pragma', 'no-cache')
        request.add_header('Expires', '0')
        
        with urlopen(request, timeout=10) as response:
            data = response.read().decode('utf-8')
            # Get the last line which contains the METAR
            metar = data.strip().split('\n')[-1]
            print(f"Successfully fetched: {metar}")
            
            # Check if METAR is stale (more than 30 minutes old)
            if retry_on_stale:
                metar_time = extract_metar_timestamp(metar)
                if metar_time:
                    now = datetime.now(timezone.utc)
                    age_minutes = (now - metar_time).total_seconds() / 60
                    print(f"METAR age: {age_minutes:.1f} minutes")
                    
                    if age_minutes > 30:
                        print(f"Warning: METAR is {age_minutes:.1f} minutes old (>30 min). Retrying once...")
                        # Wait a moment and retry once
                        import time
                        time.sleep(2)
                        return fetch_metar(url, retry_on_stale=False)
            
            return metar
    except URLError as e:
        print(f"Error fetching METAR from {url}: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

def extract_metar_timestamp(metar_text):
    """Extract timestamp from METAR text for staleness check
    
    Args:
        metar_text: Raw METAR text
        
    Returns:
        datetime object or None if timestamp cannot be extracted
    """
    if not metar_text:
        return None
    
    # Extract observation time (UTC)
    time_match = re.search(r'(\d{6}Z)', metar_text)
    if time_match:
        try:
            day = int(time_match.group(1)[0:2])
            hour = int(time_match.group(1)[2:4])
            minute = int(time_match.group(1)[4:6])
            now = datetime.now(timezone.utc)
            
            # Try current month first
            metar_date = datetime(now.year, now.month, day, hour, minute, tzinfo=timezone.utc)
            
            # If the METAR date is in the future (e.g., at month boundary), use previous month
            if metar_date > now:
                if now.month == 1:
                    metar_date = datetime(now.year - 1, 12, day, hour, minute, tzinfo=timezone.utc)
                else:
                    metar_date = datetime(now.year, now.month - 1, day, hour, minute, tzinfo=timezone.utc)
            
            return metar_date
        except (ValueError, AttributeError):
            return None
    
    return None

def parse_metar(metar_text):
    """Parse METAR text into structured data"""
    if not metar_text:
        return None
    
    data = {
        'metar': metar_text,
        'windDirection': None,
        'windSpeed': None,
        'windGust': None,
        'visibility': None,
        'temperatureC': None,
        'dewPointC': None,
        'cloudCeiling': None,
        'altimeter': None,
        'timestamp': None
    }
    
    # Extract station
    station_match = re.search(r'^([A-Z]{4})\s', metar_text)
    if station_match:
        data['station'] = station_match.group(1)
    
    # Extract observation time (UTC)
    time_match = re.search(r'(\d{6}Z)', metar_text)
    if time_match:
        day = int(time_match.group(1)[0:2])
        hour = int(time_match.group(1)[2:4])
        minute = int(time_match.group(1)[4:6])
        now = datetime.now(timezone.utc)
        metar_date = datetime(now.year, now.month, day, hour, minute, tzinfo=timezone.utc)
        data['timestamp'] = metar_date.isoformat()
    
    # Wind
    wind_match = re.search(r'(\d{3})(\d{2,3})(G(\d{2,3}))?KT', metar_text)
    if wind_match:
        data['windDirection'] = int(wind_match.group(1))
        data['windSpeed'] = int(wind_match.group(2))
        data['windGust'] = int(wind_match.group(4)) if wind_match.group(4) else None
    else:
        # Check for calm winds
        calm_wind_match = re.search(r'00000KT', metar_text)
        if calm_wind_match:
            data['windDirection'] = 0
            data['windSpeed'] = 0
            data['windGust'] = None
    
    # Visibility
    vis_match = re.search(r'(\d{1,2})SM|(M?\d/\d)SM|(CAVOK)|(P6SM)', metar_text)
    if vis_match:
        if vis_match.group(1):
            data['visibility'] = int(vis_match.group(1))
        elif vis_match.group(2):
            fraction = vis_match.group(2).replace('M', '')
            num, den = map(int, fraction.split('/'))
            data['visibility'] = num / den
        elif vis_match.group(3) == 'CAVOK':
            data['visibility'] = 10
            data['cloudCeiling'] = 99999
        elif vis_match.group(4):
            data['visibility'] = 6  # P6SM means greater than 6
    
    # Temperature and Dew Point
    temp_dew_match = re.search(r'\s(M?\d{2})/(M?\d{2})\s', metar_text)
    if temp_dew_match:
        data['temperatureC'] = int(temp_dew_match.group(1).replace('M', '-'))
        data['dewPointC'] = int(temp_dew_match.group(2).replace('M', '-'))
    
    # Clouds (ceiling defined as lowest broken or overcast layer)
    cloud_matches = re.findall(r'(BKN|OVC|VV)(\d{3})', metar_text)
    if cloud_matches:
        lowest_ceiling = float('inf')
        for cloud_layer in cloud_matches:
            height = int(cloud_layer[1]) * 100
            if height < lowest_ceiling:
                lowest_ceiling = height
        if lowest_ceiling != float('inf'):
            data['cloudCeiling'] = lowest_ceiling
    else:
        # Check for clear skies
        clr_match = re.search(r'\s(CLR|SKC)\s', metar_text)
        if clr_match:
            data['cloudCeiling'] = 99999
    
    # Altimeter
    altimeter_match = re.search(r'A(\d{4})', metar_text)
    if altimeter_match:
        data['altimeter'] = 'A' + altimeter_match.group(1)
    
    return data

def main():
    """Main function to fetch and process weather data"""
    print('Starting weather data fetch...')
    print(f'Timestamp: {datetime.now(timezone.utc).isoformat()}')
    
    # Fetch both METARs
    kcps_metar = fetch_metar(KCPS_URL)
    kstl_metar = fetch_metar(KSTL_URL)
    
    # Parse METARs
    kcps_data = parse_metar(kcps_metar)
    kstl_data = parse_metar(kstl_metar)
    
    # Create output data structure
    output_data = {
        'lastUpdated': datetime.now(timezone.utc).isoformat(),
        'kcps': kcps_data or {
            'station': 'KCPS',
            'metar': 'Data unavailable',
            'error': 'Failed to fetch METAR'
        },
        'kstl': kstl_data or {
            'station': 'KSTL',
            'metar': 'Data unavailable',
            'error': 'Failed to fetch METAR'
        }
    }
    
    # Write to file (in scripts directory, workflow will copy it)
    with open('weather-data.json', 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print('Weather data written to weather-data.json')
    print(json.dumps(output_data, indent=2))
    
    return output_data

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Fatal error: {error}')
        exit(1)
