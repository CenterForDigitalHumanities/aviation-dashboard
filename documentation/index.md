---
title: Documentation Index
permalink: /documentation/
---

# Aviation Dashboard Documentation Index

This directory contains comprehensive documentation of all restrictions, limits, and thresholds used in the SLU Aviation Dashboard project.

## Documentation Files

### 1. [Flight Restrictions Overview](flight-restrictions.md)
Complete reference for all flight restriction levels using the concentric restriction model.

### 2. [Wind Restrictions](wind-restrictions.md)
Detailed wind speed and crosswind component thresholds for different pilot categories.

### 3. [Visibility and Ceiling Restrictions](visibility-ceiling-restrictions.md)
Minimum visibility and cloud ceiling requirements for flight operations.

### 4. [Temperature Restrictions](temperature-restrictions.md)
Heat index and cold temperature operational limits and restrictions.

### 5. [Runway Information](runway-information.md)
Runway headings and airport elevation data used in calculations.

### 6. [Demo Page](demo.html)
Interactive demonstration showing all 11 flight restriction scenarios with live current conditions and detailed examples.

---

## Quick Reference

### Flight Status Levels (Concentric Model)

1. **All Pilots Clear** (Green) - No weather restrictions
2. **Private+ Only** (Orange) - Student pilots restricted
3. **Commercial/Instrument Only** (Yellow) - Student & Private pilots restricted
4. **All Flights Restricted** (Red) - All pilots restricted

### Key Principles

- **Concentric Restriction Model**: More restrictive conditions automatically apply to all less experienced pilot categories
- **Multiple Factors**: Flight status is determined by the most restrictive condition present
- **Temperature Independence**: Heat index and temperature restrictions apply in addition to wind/visibility restrictions
- **Real-time Updates**: All thresholds are checked against live METAR data every 5 minutes

---

## Data Sources

- **Weather Data**: NOAA Aviation Weather Center METAR reports
- **Primary Station**: KCPS (St. Louis Downtown Airport)
- **Backup Station**: KSTL (Lambert-St. Louis International Airport)
- **Update Frequency**: Every 15 minutes via GitHub Actions
- **Data Freshness**: METAR reports are considered valid if less than 2 hours old

---

## Version Information

**Last Updated**: October 9, 2025  
**Dashboard Version**: 1.0  
**Documentation Maintained By**: SLU Aviation Science Department

---

## Related Files

- `dashboard.html` - Main operational dashboard
- `quick.html` - Large-format TV display dashboard with weather graphics
- `dashboard5.html` - Simplified dashboard with flight status card
- `quick.html` - Large-format TV display dashboard with weather graphics
- `demo.html` - Demonstration page with scenario examples
- `shared-weather.js` - Shared calculation utilities
- `scripts/fetch-weather.py` - Weather data fetching script
- `.github/workflows/update-weather.yml` - Automated weather updates

---

*For questions or updates to these restrictions, contact the SLU Oliver L. Parks Department of Aviation Science.*
