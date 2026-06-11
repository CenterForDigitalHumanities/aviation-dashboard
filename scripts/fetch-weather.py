#!/usr/bin/env python3
"""
fetch-weather.py
Fetches METAR data from Aviation Weather Center (AWC) API and parses it into JSON format
"""

import json
import os
from datetime import datetime, timezone
from urllib.request import urlopen, Request
from urllib.error import URLError

AWC_METAR_URL = "https://aviationweather.gov/api/data/metar?ids=KCPS,KSTL&format=json"


def compute_ceiling(clouds):
    """Compute ceiling as lowest BKN/OVC base in feet AGL"""
    if not isinstance(clouds, list):
        return None
    lowest = None
    for layer in clouds:
        cover = layer.get("cover", "")
        if cover in ("BKN", "OVC") and layer.get("base") is not None:
            base = int(layer["base"])
            if lowest is None or base < lowest:
                lowest = base
    return lowest


def normalize_entry(raw):
    """Convert AWC API response to legacy-compatible format"""
    icao = raw.get("icaoId", "").upper()
    clouds = raw.get("clouds") or []
    ceiling = compute_ceiling(clouds)

    # Parse visibility — AWC returns "10+" for 10+ SM
    visib = raw.get("visib")
    if isinstance(visib, str):
        visib = visib.replace("+", "")
    try:
        visibility = float(visib) if visib else None
    except (ValueError, TypeError):
        visibility = None

    # Convert altimeter from hPa to inches Hg (AWC returns hPa)
    # Standard format: A2977 = 29.77 inHg
    altim_hpa = raw.get("altim")
    if altim_hpa is not None:
        inches = altim_hpa * 0.02953
        altimeter = f"A{int(round(inches * 100)):04d}"
    else:
        altimeter = None

    # Build timestamp from reportTime
    report_time = raw.get("reportTime")
    timestamp = report_time

    return {
        "metar": raw.get("rawOb", "").replace("METAR ", ""),
        "windDirection": raw.get("wdir"),
        "windSpeed": raw.get("wspd"),
        "windGust": raw.get("wgst"),
        "visibility": visibility,
        "temperatureC": raw.get("temp"),
        "dewPointC": raw.get("dewp"),
        "cloudCeiling": ceiling,
        "altimeter": altimeter,
        "timestamp": timestamp,
        "station": icao,
    }


def fetch_weather():
    """Fetch METAR data from AWC API and write to data/weather-data.json"""
    try:
        req = Request(AWC_METAR_URL, headers={"User-Agent": "aviation-dashboard/1.0"})
        with urlopen(req, timeout=30) as response:
            raw_data = json.loads(response.read().decode("utf-8"))

        if not isinstance(raw_data, list) or len(raw_data) == 0:
            print("No METAR data returned from AWC API")
            return

        result = {
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
        }

        for entry in raw_data:
            icao = entry.get("icaoId", "").lower()
            if icao:
                result[icao] = normalize_entry(entry)

        # Ensure output directory exists
        os.makedirs("data", exist_ok=True)

        output_path = "data/weather-data.json"
        with open(output_path, "w") as f:
            json.dump(result, f, indent=2)

        print(f"Weather data written to {output_path}")
        print(f"  KCPS: {result.get('kcps', {}).get('metar', 'N/A')[:50]}...")
        print(f"  KSTL: {result.get('kstl', {}).get('metar', 'N/A')[:50]}...")

    except URLError as e:
        print(f"Failed to fetch weather data: {e.reason}")
        raise SystemExit(1)
    except Exception as e:
        print(f"Error processing weather data: {e}")
        raise SystemExit(1)


if __name__ == "__main__":
    fetch_weather()
