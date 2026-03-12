---
title: Temperature Restrictions
permalink: /documentation/temperature-restrictions/
---

# Temperature Restrictions

## Overview

Temperature restrictions account for both extreme heat and extreme cold conditions that affect aircraft performance, engine reliability, and pilot safety. These restrictions apply **independently** of wind and visibility restrictions.

---

## Heat Index Restrictions

Heat index combines temperature and humidity to measure the apparent temperature and heat stress on pilots and aircraft systems.

### Heat Index Calculation

The heat index is calculated using the formula:

```javascript
function calculateHeatIndex(tempF, relativeHumidity) {
    if (tempF < 80) return tempF; // No heat index calculation needed below 80°F
    
    const T = tempF;
    const RH = relativeHumidity;
    
    // Rothfusz regression
    const HI = -42.379 + 2.04901523*T + 10.14333127*RH 
               - 0.22475541*T*RH - 0.00683783*T*T 
               - 0.05481717*RH*RH + 0.00122874*T*T*RH 
               + 0.00085282*T*RH*RH - 0.00000199*T*T*RH*RH;
    
    return HI;
}
```

**Source**: National Weather Service Rothfusz regression equation

### Heat Index Thresholds

| Heat Index (°F) | Restriction Level | Effect |
|-----------------|-------------------|--------|
| < 95 | None | All operations normal |
| ≥ 95 | Diamond Solo Restricted | Diamond aircraft solo flights restricted |
| ≥ 100 | Diamond Dual/Piper Solo Restricted | Diamond dual instruction and Piper solo flights restricted |
| ≥ 105 | **All Flights Restricted** | All flight operations suspended |

### Detailed Heat Index Restrictions

#### Heat Index ≥ 105°F: All Flights Restricted

**Threshold**: Heat Index ≥ 105°F  
**Effect**: Triggers "All Flights Restricted" status  
**Display**: "🌡️ Heat Index XXX°F"

**Rationale**:
- Extreme heat stress on pilots, particularly during preflight and ground operations
- Significant aircraft performance degradation (reduced density altitude performance)
- Increased risk of heat-related illness (heat exhaustion, heat stroke)
- Avionics and electrical system stress
- Reduced pilot decision-making capabilities under extreme heat

**Implementation**:
```javascript
if (heatIndex >= 105) {
    tempRestrictions.push(`🌡️ Heat Index ${heatIndex.toFixed(0)}°F`);
    status = 'all-restricted';
}
```

---

#### Heat Index ≥ 100°F: Diamond Aircraft Restricted

**Threshold**: Heat Index ≥ 100°F  
**Effect**: Restricts Diamond aircraft operations  
**Display**: "🌡️ Heat Index XXX°F - Diamond Restricted"

**Rationale**:
- Diamond DA40/DA42 aircraft have composite construction sensitive to heat
- Reduced engine cooling efficiency in high heat
- Performance limitations more pronounced in Diamond aircraft
- Cockpit temperature concerns in composite aircraft

**Note**: This is an operational note and does not change the overall flight status level unless combined with other factors.

---

#### Heat Index ≥ 95°F: Diamond Solo Restricted

**Threshold**: Heat Index ≥ 95°F  
**Effect**: Restricts Diamond solo flights  
**Display**: Not prominently displayed (documented for reference)

**Rationale**:
- Student pilots in solo flight have less experience managing heat-related performance issues
- Diamond aircraft particularly affected by high heat
- Solo operations lack the backup of an instructor

**Note**: This restriction is tracked in the detailed heat index table but not prominently displayed in the flight status card unless ≥100°F.

---

## Cold Temperature Restrictions

Cold temperatures affect engine starting, oil viscosity, battery performance, and aircraft systems.

### Cold Temperature Thresholds

| Temperature (°F) | Restriction Level | Effect |
|------------------|-------------------|--------|
| > 32 | None | Normal operations |
| < 32 | Caution | Avoid extended power-off operations |
| ≤ 23 | Limited Operations | Preheat or recent flight required |
| ≤ 14 | Restricted Operations | No solos or cross-countries |
| ≤ 5 | **All Flights Restricted** | All flight operations suspended |

### Detailed Cold Temperature Restrictions

#### Temperature ≤ 5°F: All Flights Restricted

**Threshold**: Temperature ≤ 5°F  
**Effect**: Triggers "All Flights Restricted" status  
**Display**: "❄️ Temperature XX°F"

**Rationale**:
- Extreme cold poses serious risks to engine starting and operation
- Battery capacity significantly reduced (50% or less of normal)
- Oil extremely viscous, inadequate lubrication until warmed
- Increased risk of cold-related aircraft damage
- Pilot exposure risks during preflight
- Potential fuel system icing

**Implementation**:
```javascript
if (tempF <= 5) {
    tempRestrictions.push(`❄️ Temperature ${tempF.toFixed(0)}°F`);
    status = 'all-restricted';
}
```

---

#### Temperature ≤ 14°F: No Solos or Cross-Countries

**Threshold**: Temperature ≤ 14°F  
**Effect**: Restricts solo flights and cross-country operations  
**Display**: "❄️ Temperature XX°F - No solos/XC"

**Rationale**:
- Solo student pilots lack experience with extreme cold operations
- Cross-country flights increase exposure to cold weather risks
- Limited emergency landing options in extreme cold
- Engine restart difficulties if engine stops
- Instructor presence required for cold weather operations

**Note**: Dual instruction flights may continue with proper cold weather procedures.

---

#### Temperature ≤ 23°F: Preheat or Recent Flight Required

**Threshold**: Temperature ≤ 23°F  
**Effect**: Requires engine preheating or recent operation  
**Display**: "❄️ Temperature XX°F - Preheat required"

**Rationale**:
- Cold soaking of engine oil reduces lubrication effectiveness
- Battery starting power significantly reduced
- Engine wear increased during cold starts
- Preheating or recent flight operation ensures adequate engine temperatures

**Procedures**:
- Engine preheat required if aircraft has cold-soaked overnight
- Recent flight (within 2 hours) may substitute for preheat
- Oil should be warm enough to flow freely

---

#### Temperature < 32°F: Avoid Extended Power-Off Operations

**Threshold**: Temperature < 32°F (freezing)  
**Effect**: Operational caution  
**Display**: "❄️ Temperature XX°F - Avoid extended power-off"

**Rationale**:
- Below freezing, engine may be difficult to restart if allowed to cool
- Carburetor icing risk increases
- Extended glides or pattern work should be minimized
- Engine should be kept warm through regular power applications

**Procedures**:
- Use caution during extended downwind legs
- Minimize time with engine at idle
- Be prepared for carburetor ice
- Maintain engine temperature awareness

---

## Relative Humidity Calculation

Relative humidity is required for heat index calculation and is derived from temperature and dewpoint:

```javascript
function calculateHumidity(tempF, dewpointF) {
    const T = tempF;
    const Td = dewpointF;
    
    // August-Roche-Magnus approximation
    const RH = 100 * (Math.exp((17.625 * Td) / (243.04 + Td)) / 
                      Math.exp((17.625 * T) / (243.04 + T)));
    
    return Math.min(RH, 100); // Cap at 100%
}
```

---

## Temperature Data Sources

### METAR Temperature Reporting

Temperature and dewpoint are reported in degrees Celsius in METAR:
- Example: `09/06` = Temperature 9°C, Dewpoint 6°C
- Negative temperatures: `M05/M08` = Temperature -5°C, Dewpoint -8°C

### Conversion to Fahrenheit

```javascript
function toFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}
```

---

## Implementation Details

### Code Locations

Temperature restriction checks are performed in:
- `dashboard.html` - Heat index table display and restrictions
- `quick.html` - Flight category card with temperature restrictions
- `mobile.html` - Mobile temperature display and restrictions
- `demo.html` - Live conditions and scenario examples
- `shared-weather.js` - Calculation utilities

### Display Format

Temperature restrictions use emoji indicators:
- **Heat**: 🌡️ "Heat Index XXX°F"
- **Cold**: ❄️ "Temperature XX°F"

### Combined Restrictions

Temperature restrictions combine with wind/visibility restrictions:

**Example**:
```
Private+ Only
Restricting factors: 🌬️ 22 knots, ❄️ Temperature 18°F - Preheat required
```

---

## Testing Scenarios

Temperature scenarios are demonstrated in the [demo page](demo.html):

1. **Extreme Heat** (Scenario 9): Heat Index 108°F → All Restricted
2. **Cold Weather with Winds** (Scenario 10): 18°F with 22kt winds → Private+ Only (combined)
3. **Extreme Cold** (Scenario 11): 2°F → All Restricted
4. **Heat Index Examples**: Summer day with 95°F and 65% RH → Heat Index 108°F

---

## Heat Index Reference Table

| Temp (°F) | RH 40% | RH 50% | RH 60% | RH 70% | RH 80% |
|-----------|--------|--------|--------|--------|--------|
| 80 | 80 | 81 | 81 | 82 | 83 |
| 85 | 85 | 86 | 87 | 88 | 90 |
| 90 | 91 | 92 | 94 | 96 | 98 |
| 95 | 97 | 99 | 102 | 105 | 109 |
| 100 | 104 | 107 | 111 | 116 | 121 |

**Source**: National Weather Service

---

**Related Documentation**:
- [Flight Restrictions Overview](flight-restrictions.md)
- [Wind Restrictions](wind-restrictions.md)
- [Visibility and Ceiling Restrictions](visibility-ceiling-restrictions.md)
- [Demo Page](demo.html) - Interactive temperature restriction examples
