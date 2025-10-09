---
title: Visibility and Ceiling Restrictions
permalink: /documentation/visibility-ceiling-restrictions/
---

# Visibility and Ceiling Restrictions

## Overview

Visibility and cloud ceiling minimums are critical safety factors for flight training operations. These restrictions ensure adequate visual reference and room for maneuvering during training flights.

---

## Visibility Restrictions

### Visibility Threshold: 3 Statute Miles

**Threshold**: Visibility < 3 statute miles (SM)  
**Effect**: Triggers "All Flights Restricted" status  
**Display**: "👁️ Visibility X.X SM"

### Rationale

**Minimum VFR Requirements**: While basic VFR requires 3 SM visibility in Class E airspace below 10,000 ft, training operations require clear visual conditions for:
- Traffic pattern operations
- Ground reference maneuvers
- Emergency procedures practice
- Student situational awareness

**Safety Margin**: When visibility drops below 3 SM, conditions are marginal for safe training operations regardless of pilot experience level.

### Implementation

```javascript
if (data.visibility !== null && data.visibility < 3) {
    restrictingFactors.push(`👁️ Visibility ${data.visibility.toFixed(1)} SM`);
    status = 'all-restricted';
}
```

### Data Source

Visibility is reported in statute miles (SM) in METAR reports:
- Direct reading from visibility field in METAR
- Parsed from weather-data.json file
- Example METAR: `KCPS 091853Z 27012KT 2SM BR ...` (2 SM visibility in mist)

---

## Cloud Ceiling Restrictions

### Ceiling Threshold: 1,500 feet AGL

**Threshold**: Cloud ceiling < 1,500 feet Above Ground Level (AGL)  
**Effect**: Triggers "All Flights Restricted" status  
**Display**: "☁️ Ceiling XXXX ft"

### Rationale

**Pattern Operations**: A 1,500 ft ceiling provides:
- Adequate room for traffic pattern altitude (typically 800-1,000 ft AGL)
- Vertical clearance for go-arounds and emergencies
- Safe margins below cloud bases per VFR cloud clearance requirements

**Training Requirements**: Low ceilings limit:
- Practice area accessibility
- Emergency landing options
- Cross-country flight planning
- Visual reference for ground maneuvers

**VFR Cloud Clearances**: Basic VFR requires 500 ft below clouds in Class E airspace below 10,000 ft. A 1,500 ft ceiling provides necessary safety margin for pattern operations.

---

## Ceiling Calculation

### Definition

Cloud ceiling is the height of the lowest broken (BKN) or overcast (OVC) cloud layer above ground level.

### Calculation Method

1. **Parse METAR cloud layers**: Look for BKN or OVC layers
2. **Extract height**: Height reported in hundreds of feet MSL
3. **Convert to AGL**: Subtract airport elevation

```javascript
const ceilingCloud = clouds.find(c => c.startsWith('BKN') || c.startsWith('OVC'));
if (ceilingCloud) {
    const heightMSL = parseInt(ceilingCloud.substring(3)) * 100; // feet MSL
    const ceilingAGL = heightMSL - elevation; // feet AGL
}
```

### Airport Elevations

| Airport | Elevation (MSL) | Code |
|---------|----------------|------|
| St. Louis Downtown (KCPS) | 413 feet | KCPS |
| Lambert International (KSTL) | 605 feet | KSTL |

### Example Calculations

**Example 1: KCPS with BKN012**
- Cloud layer: BKN012 (Broken at 1,200 feet MSL)
- Airport elevation: 413 feet
- Ceiling AGL: 1,200 - 413 = **787 feet AGL**
- Status: **All Flights Restricted** (below 1,500 ft threshold)

**Example 2: KSTL with OVC025**
- Cloud layer: OVC025 (Overcast at 2,500 feet MSL)
- Airport elevation: 605 feet
- Ceiling AGL: 2,500 - 605 = **1,895 feet AGL**
- Status: No ceiling restriction (above 1,500 ft threshold)

**Example 3: Clear Skies**
- Cloud layer: SKC or CLR
- Ceiling: Infinity (no ceiling)
- Status: No ceiling restriction

---

## Cloud Layer Types

### Not Considered Ceilings

- **FEW** (Few, 1-2 oktas): < 2/8 sky coverage
- **SCT** (Scattered, 3-4 oktas): 3/8 to 4/8 sky coverage
- **SKC** (Sky Clear): No clouds
- **CLR** (Clear): No clouds below 12,000 ft (automated stations)

### Considered Ceilings

- **BKN** (Broken, 5-7 oktas): 5/8 to 7/8 sky coverage
- **OVC** (Overcast, 8 oktas): Complete cloud coverage

**Rationale**: Only BKN and OVC layers significantly restrict vertical flight operations and visual reference.

---

## Implementation Details

### Code Locations

Ceiling calculations are performed in:
- `dashboard.html` - `checkRestrictions()` function
- `dashboard5.html` - `checkRestrictions()` function
- `demo.html` - `loadCurrentConditions()` function

### Parsing Logic

```javascript
const ceilingCloud = (() => {
    const clouds = data.clouds ?? [];
    
    // Look for BKN or OVC layers
    const str = clouds.find(c => 
        typeof c === 'string' && 
        (c.startsWith('BKN') || c.startsWith('OVC'))
    );
    
    if (str) return str;
    
    // Handle numeric ceiling values
    let num = clouds.find(c => typeof c === 'number');
    if (num == null) return undefined;
    
    // Treat sentinel values like 99999 as no ceiling
    if (num >= 99999) return undefined;
    
    const hundreds = Math.max(1, Math.round(num / 100));
    return 'BKN' + String(hundreds).padStart(3, '0');
})();

const ceiling = ceilingCloud 
    ? parseInt(ceilingCloud.substring(3)) * 100 - elevation 
    : Infinity;
```

---

## Special Conditions

### Indefinite Ceiling (Vertical Visibility)

When visibility is restricted by precipitation or obscuration:
- METAR reports: `VV003` (Vertical visibility 300 feet)
- Treated as ceiling for restriction purposes
- Always triggers "All Flights Restricted"

### Multiple Cloud Layers

When multiple BKN or OVC layers exist:
- Use the **lowest** layer as the ceiling
- Example: `BKN012 OVC025` → Use BKN012

### Automated vs Manual Reports

- **Automated stations**: Report "CLR" (clear below 12,000 ft)
- **Manual stations**: Report "SKC" (sky clear)
- Both treated as no ceiling for restriction purposes

---

## Testing Scenarios

The following scenarios are demonstrated in the [demo page](demo.html):

1. **Low Ceiling** (Scenario 5): 1,200 ft ceiling → All Restricted
2. **Poor Visibility** (Scenario 6): 2.0 SM visibility → All Restricted
3. **Multiple Factors** (Scenario 7): 1,800 ft ceiling (not restricting) with winds → Commercial Only

---

## Display Examples

**Ceiling Restriction**:
```
All Flights Restricted
Restricting factors: ☁️ Ceiling 1200 ft
```

**Visibility Restriction**:
```
All Flights Restricted
Restricting factors: 👁️ Visibility 2.0 SM
```

**Both Factors**:
```
All Flights Restricted
Restricting factors: ☁️ Ceiling 1100 ft, 👁️ Visibility 1.5 SM
```

---

**Related Documentation**:
- [Flight Restrictions Overview](flight-restrictions.md)
- [Wind Restrictions](wind-restrictions.md)
- [Runway Information](runway-information.md)
- [Demo Page](demo.html) - Interactive visibility and ceiling examples
