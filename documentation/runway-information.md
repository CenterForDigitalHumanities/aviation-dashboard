---
layout: default
title: Runway Information
permalink: /documentation/runway-information/
---

# Runway Information

## Overview

Runway information is critical for crosswind component calculations. This document details the runways used for operations and the associated airport data.

---

## Primary Airport: KCPS (St. Louis Downtown Airport)

### Airport Information

**Airport Name**: St. Louis Downtown Airport (formerly Bi-State Parks Airport)  
**ICAO Code**: KCPS  
**IATA Code**: CPS  
**Location**: Cahokia, Illinois (near St. Louis, Missouri)  
**Elevation**: 413 feet MSL  
**Coordinates**: 38°34'10"N 90°09'26"W

### Runway Configuration

#### Runway 12/30

**Runway Designations**: 12 and 30  
**Runway Length**: 6,498 feet  
**Runway Width**: 100 feet  
**Surface**: Asphalt

**Magnetic Headings**:
- **Runway 12**: 122° magnetic
- **Runway 30**: 302° magnetic (reciprocal of 122°)

### Runway Usage

KCPS Runway 12/30 is the primary runway used for:
- Flight training operations
- Traffic pattern work
- Touch-and-go landings
- Student pilot training

**Active Runway Selection**: Determined by wind direction (typically land into the wind)
- Winds from 030° to 210°: Runway 12 active
- Winds from 210° to 030°: Runway 30 active

---

## Backup Airport: KSTL (Lambert-St. Louis International Airport)

### Airport Information

**Airport Name**: St. Louis Lambert International Airport  
**ICAO Code**: KSTL  
**IATA Code**: STL  
**Location**: St. Louis, Missouri  
**Elevation**: 605 feet MSL  
**Coordinates**: 38°44'52"N 90°21'36"W

### Purpose

KSTL serves as:
- Backup weather data source when KCPS METAR is unavailable or outdated
- Regional weather reference
- Alternative observation point for area weather conditions

**Usage in Dashboard**: When KCPS METAR is older than 2 hours or unavailable, the system uses KSTL data for restriction calculations.

### Major Runways (Reference Only)

KSTL has multiple runways, but they are **not used** for crosswind calculations in the dashboard:
- Runway 11/29: 9,003 feet
- Runway 12L/30R: 11,019 feet
- Runway 12R/30L: 9,003 feet
- Runway 06/24: 7,607 feet

**Note**: The dashboard calculates crosswinds based on KCPS Runway 12/30 regardless of which airport provides the weather data.

---

## Crosswind Calculation Method

### Formula

Crosswind component is calculated using trigonometry:

```javascript
function calculateCrosswind(windDirection, windSpeed, runwayHeading) {
    const angleDiff = Math.abs(windDirection - runwayHeading);
    const normalizedAngle = angleDiff > 180 ? 360 - angleDiff : angleDiff;
    const crosswind = windSpeed * Math.sin(normalizedAngle * Math.PI / 180);
    return crosswind;
}
```

### Parameters

- **windDirection**: Magnetic direction wind is coming FROM (degrees)
- **windSpeed**: Wind speed in knots
- **runwayHeading**: Magnetic heading of runway (122° or 302°)

### Calculation Process

1. Calculate angle between wind direction and runway heading
2. Normalize angle to 0-180° range
3. Calculate sine of the angle
4. Multiply wind speed by sine to get crosswind component
5. Use maximum crosswind of both runway directions (12 and 30)

### Example Calculations

#### Example 1: Direct Crosswind

**Given**:
- Wind: 180° at 20 knots
- Runway 12: heading 122°

**Calculation**:
```
Angle difference: |180 - 122| = 58°
Crosswind: 20 * sin(58°) = 20 * 0.848 = 17.0 knots
```

**Result**: 17.0 knot crosswind component

---

#### Example 2: Headwind Component

**Given**:
- Wind: 120° at 20 knots
- Runway 12: heading 122°

**Calculation**:
```
Angle difference: |120 - 122| = 2°
Crosswind: 20 * sin(2°) = 20 * 0.035 = 0.7 knots
```

**Result**: 0.7 knot crosswind component (nearly direct headwind)

---

#### Example 3: Quartering Wind

**Given**:
- Wind: 090° at 15 knots
- Runway 12: heading 122°

**Calculation**:
```
Angle difference: |90 - 122| = 32°
Crosswind: 15 * sin(32°) = 15 * 0.530 = 8.0 knots
```

**Result**: 8.0 knot crosswind component

---

## Dual Runway Check

The dashboard calculates crosswind for **both runway directions** and uses the **maximum** value:

```javascript
const cross12 = calculateCrosswind(windDir, windSpeed, 122);  // Runway 12
const cross30 = calculateCrosswind(windDir, windSpeed, 302);  // Runway 30
const maxCrosswind = Math.max(cross12, cross30);
```

**Rationale**: This ensures restrictions are based on the worst-case scenario regardless of which runway is in use. Pilots can land on either runway depending on wind direction, so both must be considered.

---

## Runway Heading Selection Rationale

### Why 122° instead of 120°?

Runway 12 is designated as "120°" in common terminology (12 × 10 = 120), but the **actual magnetic heading** is 122°.

**Reasons for precision**:
- Magnetic variation in the St. Louis area
- Actual runway construction alignment
- GPS and navigation system accuracy
- Improved crosswind calculation accuracy

**Impact**: Using 122° instead of 120° provides:
- More accurate crosswind components
- Better alignment with actual operational conditions
- Consistency with aviation charts and approach plates

---

## Elevation Usage in Ceiling Calculations

### KCPS Elevation: 413 feet MSL

Used to convert cloud heights from Mean Sea Level (MSL) to Above Ground Level (AGL):

```javascript
const ceilingAGL = cloudHeightMSL - 413;
```

**Example**:
- METAR reports: BKN025 (2,500 feet MSL)
- Ceiling AGL: 2,500 - 413 = 2,087 feet AGL

### KSTL Elevation: 605 feet MSL

Used when KSTL data is the primary source:

```javascript
const ceilingAGL = cloudHeightMSL - 605;
```

**Example**:
- METAR reports: OVC030 (3,000 feet MSL)
- Ceiling AGL: 3,000 - 605 = 2,395 feet AGL

---

## Implementation Details

### Code Locations

Runway information is used in:
- `shared-weather.js` - `calculateCrosswind()` function
- `dashboard.html` - Crosswind calculations for runway 12/30
- `dashboard5.html` - Crosswind calculations for runway 12/30
- `demo.html` - Crosswind examples and live calculations

### Constants

```javascript
const kcpsElevation = 413;  // feet MSL
const kstlElevation = 605;  // feet MSL
const runway12Heading = 122;  // degrees magnetic
const runway30Heading = 302;  // degrees magnetic
```

---

## Future Considerations

### Additional Runways

If operations expand to other airports or runways:
1. Add runway heading constants
2. Update crosswind calculation to include all relevant runways
3. Document new airport elevations
4. Update ceiling calculations accordingly

### Runway Surface Conditions

Current system does not account for:
- Runway surface (dry, wet, icy)
- Runway length limitations
- Obstacle clearance

These factors may be added in future versions if operational needs require.

---

## Quick Reference Table

| Airport | Code | Elevation | Runway | Headings | Length |
|---------|------|-----------|--------|----------|--------|
| St. Louis Downtown | KCPS | 413 ft MSL | 12/30 | 122°/302° | 6,498 ft |
| Lambert International | KSTL | 605 ft MSL | (Reference) | Various | Various |

---

**Related Documentation**:
- [Flight Restrictions Overview](flight-restrictions.md)
- [Wind Restrictions](wind-restrictions.md)
- [Visibility and Ceiling Restrictions](visibility-ceiling-restrictions.md)
