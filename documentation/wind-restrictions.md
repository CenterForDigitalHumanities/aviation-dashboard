---
layout: default
title: Wind Restrictions
permalink: /documentation/wind-restrictions/
---

# Wind Restrictions

## Overview

Wind restrictions are the primary operational limits affecting flight training operations. These include both direct wind speed limits and crosswind component calculations for the active runway.

---

## Wind Speed Thresholds

### Summary Table

| Wind Speed (knots) | Flight Status | Pilot Categories Authorized |
|-------------------|---------------|----------------------------|
| < 20 | All Pilots Clear | All |
| 20-24 | Private+ Only | Private, Commercial, Instrument, CFI |
| 25-29 | Commercial/Instrument Only | Commercial, Instrument, CFI |
| ≥ 30 | All Flights Restricted | None |

### Detailed Breakdowns

#### Student Pilot Limit: 20 knots

**Threshold**: Wind speed ≥ 20 knots  
**Effect**: Restricts student pilots  
**Status**: Private+ Only (or higher)

**Rationale**: Student pilots are building foundational skills and may not have sufficient experience managing higher wind conditions, particularly during takeoff and landing phases.

---

#### Private Pilot Limit: 25 knots

**Threshold**: Wind speed ≥ 25 knots  
**Effect**: Restricts student and private pilots  
**Status**: Commercial/Instrument Only (or higher)

**Rationale**: Private pilots may have limited recent experience with higher winds. Commercial and instrument-rated pilots have demonstrated higher skill levels and currency requirements.

---

#### All Pilots Limit: 30 knots

**Threshold**: Wind speed ≥ 30 knots  
**Effect**: Restricts all pilots  
**Status**: All Flights Restricted

**Rationale**: Winds at or above 30 knots pose significant challenges for all aircraft in the training fleet, including increased risk of loss of control, difficulty maintaining runway alignment, and potential aircraft damage.

---

## Wind Gust Considerations

### Gust Threshold: 30 knots

**Threshold**: Wind gusts ≥ 30 knots  
**Effect**: Triggers "All Flights Restricted" status  
**Display**: Shows as "🌬️ Gusts XX knots" (only if gusts exceed sustained wind speed)

**Rationale**: Sudden wind gusts can create dangerous situations during critical phases of flight, particularly during landing. Gusts of 30 knots or greater are considered unsafe regardless of sustained wind speed.

---

## Crosswind Component Calculations

### Runway Information

**Primary Runway**: 12/30 at KCPS  
- Runway 12: Magnetic heading 122°  
- Runway 30: Magnetic heading 302°

### Calculation Method

Crosswind component is calculated using:

```javascript
crosswind = windSpeed * sin(|windDirection - runwayHeading|)
```

The system calculates crosswind for both runway directions and uses the maximum value.

### Crosswind Thresholds

| Crosswind (knots) | Flight Status | Pilot Categories Authorized |
|-------------------|---------------|----------------------------|
| ≤ 10 | All Pilots Clear | All |
| > 10 and ≤ 15 | Private+ Only | Private, Commercial, Instrument, CFI |
| > 15 and ≤ 20 | Commercial/Instrument Only | Commercial, Instrument, CFI |
| > 20 | All Flights Restricted | None |

#### Student Pilot Crosswind Limit: 10 knots

**Threshold**: Crosswind component > 10 knots  
**Effect**: Restricts student pilots  
**Status**: Private+ Only (or higher)

**Rationale**: Crosswind landings require precise control and coordination. Student pilots are still developing these skills and may not safely handle crosswinds exceeding 10 knots.

---

#### Private Pilot Crosswind Limit: 15 knots

**Threshold**: Crosswind component > 15 knots  
**Effect**: Restricts student and private pilots  
**Status**: Commercial/Instrument Only (or higher)

**Rationale**: Crosswinds above 15 knots require advanced techniques and consistent proficiency. Commercial and instrument pilots maintain higher currency requirements.

---

#### All Pilots Crosswind Limit: 20 knots

**Threshold**: Crosswind component > 20 knots  
**Effect**: Restricts all pilots  
**Status**: All Flights Restricted

**Rationale**: Crosswind components exceeding 20 knots approach or exceed the demonstrated crosswind capability of many training aircraft and pose significant risk of runway excursion or loss of control.

---

## Implementation Details

### Code Location

Wind calculations are performed in:
- `shared-weather.js` - `calculateCrosswind()` function
- `dashboard.html` - `checkRestrictions()` function
- `dashboard5.html` - `checkRestrictions()` function
- `demo.html` - `loadCurrentConditions()` function

### Calculation Example

**Given**:
- Wind: 270° at 22 knots
- Runway: 12 (heading 122°)

**Calculation**:
```
Difference = |270 - 122| = 148°
Crosswind = 22 * sin(148°) = 22 * 0.53 ≈ 11.7 knots
```

**Result**: Crosswind component of 11.7 knots triggers **Private+ Only** status

---

## Display Format

Wind restrictions are displayed with the 🌬️ emoji indicator:

**Examples**:
- "🌬️ 22 knots" - Direct wind speed restriction
- "🌬️ Crosswind 11.7 knots" - Crosswind component restriction
- "🌬️ Gusts 32 knots" - Wind gust restriction (only shown if gusts > sustained wind)

---

## Testing Scenarios

The following scenarios are demonstrated in `demo.html`:

1. **Moderate Winds** (Scenario 2): 22 knots → Private+ Only
2. **High Crosswind** (Scenario 3): 18.2 knot crosswind → Commercial Only
3. **Very High Winds** (Scenario 4): 32 knots → All Restricted
4. **Multiple Factors** (Scenario 7): 26 knots + 16.8 knot crosswind → Commercial Only
5. **Cold Weather with Winds** (Scenario 10): 22 knots + cold temp → Private+ Only

---

**Related Documentation**:
- [Flight Restrictions Overview](flight-restrictions.md)
- [Visibility and Ceiling Restrictions](visibility-ceiling-restrictions.md)
- [Runway Information](runway-information.md)
