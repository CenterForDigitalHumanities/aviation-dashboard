---
layout: default
title: Flight Restrictions Overview
permalink: /documentation/flight-restrictions/
---

# Flight Restrictions Overview

## Concentric Restriction Model

The SLU Aviation Dashboard uses a **concentric restriction model** where more restrictive weather conditions automatically apply to all less experienced pilot categories. This simplifies decision-making and enhances safety by ensuring that when conditions become marginal or dangerous, appropriate restrictions cascade to all affected pilot levels.

---

## Flight Status Levels

### 1. All Pilots Clear (Green)

**Indicator**: Green background (#d4edda)  
**Border**: Green (#28a745)

**Conditions**: No weather restrictions in effect

**Requirements**:
- Wind speed < 20 knots
- Crosswind component ≤ 10 knots
- Cloud ceiling ≥ 1,500 ft AGL (or clear)
- Visibility ≥ 3 statute miles
- Heat index < 105°F
- Temperature > 5°F
- No additional restricting factors

**Pilots Authorized**: All pilot categories (Student, Private, Commercial, Instrument, CFI)

---

### 2. Private+ Only (Orange)

**Indicator**: Orange/red background (#f8d7da)  
**Border**: Orange (#fd7e14)

**Conditions**: Student pilots restricted due to moderate wind conditions

**Restricting Factors**:
- Wind speed ≥ 20 knots AND < 25 knots, OR
- Crosswind component > 10 knots AND ≤ 15 knots

**Pilots Authorized**: Private, Commercial, Instrument, CFI  
**Pilots Restricted**: Student pilots

**Rationale**: Student pilots have limited experience with higher winds and crosswind corrections.

---

### 3. Commercial/Instrument Only (Yellow)

**Indicator**: Yellow background (#fff3cd)  
**Border**: Yellow/gold (#ffc107)

**Conditions**: Student and Private pilots restricted due to high wind conditions

**Restricting Factors**:
- Wind speed ≥ 25 knots AND < 30 knots, OR
- Crosswind component > 15 knots AND ≤ 20 knots

**Pilots Authorized**: Commercial, Instrument, CFI  
**Pilots Restricted**: Student and Private pilots

**Rationale**: High winds require advanced skills typically developed during commercial or instrument training.

---

### 4. All Flights Restricted (Red)

**Indicator**: Red background (#f8d7da)  
**Border**: Dark red (#dc3545)

**Conditions**: All pilots restricted due to severe or hazardous conditions

**Restricting Factors** (any one triggers this status):
- Wind speed ≥ 30 knots
- Wind gusts ≥ 30 knots
- Crosswind component > 20 knots
- Cloud ceiling < 1,500 ft AGL
- Visibility < 3 statute miles
- Heat index ≥ 105°F
- Temperature ≤ 5°F

**Pilots Authorized**: None (flight operations suspended)  
**Pilots Restricted**: All pilot categories

**Rationale**: Conditions are too severe for safe flight training operations regardless of experience level.

---

## Emoji Indicators

Restricting factors are displayed with intuitive emoji indicators:

| Emoji | Factor Type | Example |
|-------|-------------|---------|
| 🌬️ | Wind/Crosswind | "🌬️ 26 knots" or "🌬️ Crosswind 18.2 knots" |
| ☁️ | Cloud Ceiling | "☁️ Ceiling 1200 ft" |
| 👁️ | Visibility | "👁️ Visibility 2.0 SM" |
| 🌡️ | Heat Index | "🌡️ Heat Index 108°F" |
| ❄️ | Cold Temperature | "❄️ Temperature 2°F" |

---

## Decision Logic

The system evaluates conditions in the following order:

1. **Check for All Flights Restricted conditions** (most restrictive)
   - Winds ≥ 30kt, gusts ≥ 30kt, crosswind > 20kt
   - Ceiling < 1,500ft, visibility < 3 SM
   - Heat index ≥ 105°F or temperature ≤ 5°F

2. **Check for Commercial/Instrument Only conditions**
   - Winds ≥ 25kt AND < 30kt
   - Crosswind > 15kt AND ≤ 20kt

3. **Check for Private+ Only conditions**
   - Winds ≥ 20kt AND < 25kt
   - Crosswind > 10kt AND ≤ 15kt

4. **Default to All Pilots Clear**
   - No restricting factors present

5. **Add temperature restrictions** (independent of wind/visibility)
   - Applied in addition to above restrictions
   - Displayed with appropriate emoji indicators

---

## Multiple Restricting Factors

When multiple restricting factors are present, all are displayed in the flight status card. The overall status is determined by the **most restrictive** factor.

**Example**: If wind speed is 26 knots AND crosswind is 18 knots:
- Status: **Commercial/Instrument Only**
- Display: "Restricting factors: 🌬️ 26 knots, 🌬️ Crosswind 18.0 knots"

**Example with Temperature**: If wind speed is 22 knots AND temperature is 18°F:
- Status: **Private+ Only**
- Display: "Restricting factors: 🌬️ 22 knots, ❄️ Temperature 18°F - Preheat required"

---

## Implementation Notes

- Flight status is recalculated every time weather data is updated (every 5 minutes)
- The most restrictive condition always takes precedence
- Temperature restrictions are evaluated independently but can upgrade the overall status
- All thresholds are applied consistently across both dashboards (dashboard.html and dashboard5.html)
- The demo.html page shows 11 scenarios demonstrating all restriction levels

---

**Related Documentation**:
- [Wind Restrictions](wind-restrictions.md)
- [Visibility and Ceiling Restrictions](visibility-ceiling-restrictions.md)
- [Temperature Restrictions](temperature-restrictions.md)
