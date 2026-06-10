#!/usr/bin/env python3
"""
fetch-weather.py
Fetches METAR data from Aviation Weather Center (AWC) API and parses it into JSON format
"""

import json
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

