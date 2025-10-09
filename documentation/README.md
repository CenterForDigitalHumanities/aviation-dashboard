---
title: Documentation Guide
permalink: /documentation/guide/
---

# Documentation Directory

This directory contains comprehensive documentation of all operational restrictions, limits, and thresholds used in the Saint Louis University Oliver L. Parks Department of Aviation Science Dashboard.

---

## Purpose

This documentation serves to:

1. **Maintain Records**: Keep authoritative records of all restriction thresholds
2. **Support Training**: Provide reference material for instructors and students
3. **Ensure Consistency**: Document the exact values used across all dashboard implementations
4. **Enable Updates**: Facilitate informed decisions when modifying restriction criteria
5. **Regulatory Compliance**: Document safety criteria and operational limits

---

## Document Structure

### [Index](index.md)
Quick navigation to all documentation files with overview of the concentric restriction model and data sources.

### [Flight Restrictions Overview](flight-restrictions.md)
**Key Topics**:
- Concentric restriction model explanation
- Four flight status levels (All Clear, Private+, Commercial, All Restricted)
- Decision logic and evaluation order
- Emoji indicators and display format
- Multiple restricting factors handling

**Use This When**: Understanding the overall restriction framework and how different factors interact.

---

### [Wind Restrictions](wind-restrictions.md)
**Key Topics**:
- Wind speed thresholds: 20kt, 25kt, 30kt
- Crosswind component calculations
- Crosswind thresholds: 10kt, 15kt, 20kt
- Wind gust considerations (30kt threshold)
- Runway 12/30 crosswind calculations

**Threshold Tables**:
| Threshold | Value | Effect |
|-----------|-------|--------|
| Student Wind Limit | 20 knots | Private+ Only |
| Private Wind Limit | 25 knots | Commercial Only |
| All Pilots Wind Limit | 30 knots | All Restricted |
| Student Crosswind | 10 knots | Private+ Only |
| Private Crosswind | 15 knots | Commercial Only |
| All Pilots Crosswind | 20 knots | All Restricted |
| Wind Gust Limit | 30 knots | All Restricted |

**Use This When**: Setting up or modifying wind-based restrictions, calculating crosswind components, or understanding pilot-specific wind limits.

---

### [Visibility and Ceiling Restrictions](visibility-ceiling-restrictions.md)
**Key Topics**:
- Visibility threshold: 3 statute miles
- Cloud ceiling threshold: 1,500 feet AGL
- Ceiling calculation methodology
- Airport elevation conversions (KCPS 413 ft, KSTL 605 ft)
- Cloud layer types (BKN, OVC vs FEW, SCT, CLR)
- Special conditions (vertical visibility, multiple layers)

**Threshold Tables**:
| Threshold | Value | Effect |
|-----------|-------|--------|
| Minimum Visibility | 3 SM | All Restricted if below |
| Minimum Ceiling | 1,500 ft AGL | All Restricted if below |
| KCPS Elevation | 413 ft MSL | For AGL calculation |
| KSTL Elevation | 605 ft MSL | For AGL calculation |

**Use This When**: Understanding ceiling/visibility restrictions, converting MSL to AGL, or troubleshooting ceiling calculation issues.

---

### [Temperature Restrictions](temperature-restrictions.md)
**Key Topics**:
- Heat index calculation (Rothfusz regression)
- Heat index thresholds: 95°F, 100°F, 105°F
- Cold temperature thresholds: 32°F, 23°F, 14°F, 5°F
- Relative humidity calculation
- Diamond aircraft specific restrictions
- Preheat requirements

**Threshold Tables - Heat**:
| Heat Index | Effect |
|------------|--------|
| < 95°F | Normal operations |
| ≥ 95°F | Diamond solo restricted |
| ≥ 100°F | Diamond dual/Piper solo restricted |
| ≥ 105°F | **All Flights Restricted** |

**Threshold Tables - Cold**:
| Temperature | Effect |
|-------------|--------|
| > 32°F | Normal operations |
| < 32°F | Avoid extended power-off ops |
| ≤ 23°F | Preheat or recent flight required |
| ≤ 14°F | No solos or cross-countries |
| ≤ 5°F | **All Flights Restricted** |

**Use This When**: Evaluating heat index or cold weather restrictions, understanding Diamond aircraft limitations, or calculating relative humidity from dewpoint.

---

### [Runway Information](runway-information.md)
**Key Topics**:
- KCPS Runway 12/30 specifications
- Runway magnetic headings: 122°/302°
- Airport elevations for ceiling calculations
- Crosswind calculation methodology
- Dual runway checking logic
- KSTL backup weather reference

**Key Data**:
| Item | Value |
|------|-------|
| Primary Airport | KCPS (St. Louis Downtown) |
| KCPS Elevation | 413 feet MSL |
| Runway | 12/30 |
| Runway 12 Heading | 122° magnetic |
| Runway 30 Heading | 302° magnetic |
| Backup Airport | KSTL (Lambert Intl) |
| KSTL Elevation | 605 feet MSL |

**Use This When**: Calculating crosswind components, converting cloud heights to AGL, or understanding runway-specific data.

---

### [Demo Page](demo.html)
**Key Topics**:
- Live current conditions with real-time METAR data
- 11 interactive scenarios demonstrating all restriction levels
- Visual examples of all four flight status levels
- Combined wind, visibility, ceiling, and temperature scenarios
- Heat index and cold weather examples

**Scenario Coverage**:
1. Perfect flying conditions (All Clear)
2. Moderate winds (Private+ Only)
3. High crosswind (Commercial Only)
4. Very high winds (All Restricted)
5. Low ceiling (All Restricted)
6. Poor visibility (All Restricted)
7. Multiple factors (Commercial Only)
8. Marginal conditions (Private+ Only)
9. Extreme heat (All Restricted)
10. Cold weather with winds (Private+ Only)
11. Extreme cold (All Restricted)

**Use This When**: Training pilots, explaining the restriction model, demonstrating system capabilities, or understanding how different weather conditions affect flight status.

---

## Quick Reference: All Thresholds

### Wind Thresholds
- **20 knots**: Student pilots restricted (Private+ Only)
- **25 knots**: Private pilots restricted (Commercial Only)
- **30 knots**: All pilots restricted

### Crosswind Thresholds
- **10 knots**: Student pilots restricted (Private+ Only)
- **15 knots**: Private pilots restricted (Commercial Only)
- **20 knots**: All pilots restricted

### Visibility & Ceiling Thresholds
- **3 SM**: Minimum visibility (All Restricted if below)
- **1,500 ft AGL**: Minimum ceiling (All Restricted if below)

### Temperature Thresholds
- **105°F**: Heat index limit (All Restricted)
- **5°F**: Cold temperature limit (All Restricted)

### Operational Data
- **Runway**: 12/30 at KCPS
- **Headings**: 122° / 302° magnetic
- **Elevations**: KCPS 413 ft MSL, KSTL 605 ft MSL

---

## Modification Guidelines

### When Updating Thresholds

1. **Review Documentation**: Read the relevant document thoroughly
2. **Document Rationale**: Add explanation for why threshold is changing
3. **Update All References**: Search for the old value across all files
4. **Update Code**: Modify implementation in dashboard files and shared-weather.js
5. **Update Documentation**: Revise markdown files with new values
6. **Test Thoroughly**: Verify new thresholds work as expected in demo.html
7. **Update Version Info**: Note changes in index.md
8. **Communicate Changes**: Inform aviation department of modifications

### Files to Check When Changing Thresholds

**Wind Restrictions**:
- `documentation/wind-restrictions.md`
- `dashboard.html` - checkRestrictions()
- `dashboard5.html` - checkRestrictions()
- `documentation/demo.html` - loadCurrentConditions()
- `shared-weather.js` - calculateCrosswind()

**Temperature Restrictions**:
- `documentation/temperature-restrictions.md`
- `dashboard.html` - heat index table
- `dashboard5.html` - heat index table and flight status
- `documentation/demo.html` - temperature scenarios
- `shared-weather.js` - calculateHeatIndex(), calculateHumidity()

**Visibility/Ceiling Restrictions**:
- `documentation/visibility-ceiling-restrictions.md`
- `dashboard.html` - checkRestrictions()
- `dashboard5.html` - checkRestrictions()
- `documentation/demo.html` - loadCurrentConditions()

---

## Regulatory References

### Federal Aviation Regulations (FARs)

**14 CFR Part 91 (General Operating Rules)**:
- §91.155 - Basic VFR weather minimums
- §91.157 - Special VFR weather minimums

**VFR Minimums** (Class E airspace below 10,000 ft):
- Visibility: 3 statute miles
- Cloud clearance: 500 ft below, 1,000 ft above, 2,000 ft horizontal

**Training Operations**: Many training operations use more conservative limits than regulatory minimums for safety.

### Practical Test Standards (PTS) / Airman Certification Standards (ACS)

**Private Pilot ACS**:
- Crosswind component limitations per aircraft POH
- Student pilot solo endorsement requirements

**Commercial Pilot ACS**:
- Higher proficiency expectations
- More challenging weather conditions

---

## Data Sources & Methodology

### Weather Data
- **Source**: NOAA Aviation Weather Center METAR reports
- **Primary Station**: KCPS (St. Louis Downtown Airport)
- **Backup Station**: KSTL (Lambert International Airport)
- **Update Frequency**: Every 15 minutes via GitHub Actions
- **Valid Duration**: METAR reports considered current if less than 2 hours old

### Calculation Methods
- **Crosswind**: Trigonometric calculation using wind angle vs runway heading
- **Heat Index**: National Weather Service Rothfusz regression equation
- **Relative Humidity**: August-Roche-Magnus approximation from temp/dewpoint
- **Ceiling**: Lowest BKN or OVC layer converted from MSL to AGL

---

## Version History

### Version 1.0 (October 2025)
- Initial documentation creation
- All restriction thresholds documented
- Concentric restriction model established
- Temperature restrictions integrated
- Comprehensive examples and scenarios

---

## Contact Information

For questions about these restrictions or to propose changes:

**Saint Louis University**  
**Oliver L. Parks Department of Aviation Science**

Restrictions should be reviewed periodically and updated based on:
- Safety incident analysis
- Regulatory changes
- Aircraft fleet changes
- Instructor feedback
- Student performance data

---

## Additional Resources

### Project Files
- `README.md` - Project overview
- `dashboard.html` - Main operational dashboard
- `dashboard5.html` - Simplified dashboard
- `documentation/demo.html` - Demonstration with scenarios
- `shared-weather.js` - Calculation utilities
- `.github/workflows/update-weather.yml` - Automated data updates
- `scripts/fetch-weather.py` - Weather fetching script

### External References
- [NOAA Aviation Weather Center](https://aviationweather.gov)
- [National Weather Service Heat Index](https://www.weather.gov/safety/heat-index)
- [FAA Regulations (eCFR)](https://www.ecfr.gov/current/title-14)

---

*This documentation was created on October 9, 2025, and should be updated whenever operational thresholds are modified.*
