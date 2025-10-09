---
title: SLU Aviation Dashboard
---

# Saint Louis University Aviation Dashboard

## Real-Time Flight Restrictions and Weather Information

Welcome to the SLU Oliver L. Parks Department of Aviation Science Dashboard. This system provides real-time weather information and flight restriction status for training operations.

---

## 🛩️ Dashboards

### [Main Dashboard](dashboard.html)
Full-featured dashboard with comprehensive weather data, heat index restrictions, and pilot-specific limitations.

### [Simplified Dashboard](dashboard5.html)
Streamlined dashboard with prominent flight status card showing current operational status at a glance.

### [Quick View Dashboard](quick.html)
Large-format TV display dashboard with weather graphics, auto-refresh timers, and optimized two-column layout for monitor viewing.

### [Demo Page](documentation/demo.html)
Demonstration page showing all possible status scenarios with live current conditions and 11 example scenarios.

---

## 📚 Documentation

### [Documentation Index](documentation/)
Complete documentation of all restrictions, limits, and thresholds used in the dashboard system.

**Available Documentation:**
- [Flight Restrictions Overview](documentation/flight-restrictions/) - Concentric restriction model and status levels
- [Wind Restrictions](documentation/wind-restrictions/) - Wind speed and crosswind thresholds
- [Visibility & Ceiling](documentation/visibility-ceiling-restrictions/) - Minimum visibility and ceiling requirements
- [Temperature Restrictions](documentation/temperature-restrictions/) - Heat index and cold temperature limits
- [Runway Information](documentation/runway-information/) - Runway specifications and calculations
- [Documentation Guide](documentation/guide/) - Complete guide to using the documentation

---

## 🌡️ Current Status

The dashboards display real-time weather data from:
- **KCPS** (St. Louis Downtown Airport) - Primary station
- **KSTL** (Lambert International Airport) - Backup station

Data is automatically updated every **15 minutes** via GitHub Actions.

---

## 🎯 Flight Status Levels

The system uses a **concentric restriction model** with four status levels:

| Status | Color | Meaning |
|--------|-------|---------|
| **All Pilots Clear** | 🟢 Green | No weather restrictions in effect |
| **Private+ Only** | 🟠 Orange | Student pilots restricted |
| **Commercial/Instrument Only** | 🟡 Yellow | Student & Private pilots restricted |
| **All Flights Restricted** | 🔴 Red | All pilots restricted |

---

## 📊 Key Features

- ✅ **Real-time METAR data** from NOAA Aviation Weather Center
- ✅ **Automatic updates** every 5 minutes on dashboards
- ✅ **Crosswind calculations** for Runway 12/30
- ✅ **Heat index calculations** with relative humidity
- ✅ **Concentric restriction model** for clear decision-making
- ✅ **Temperature restrictions** for both extreme heat and cold
- ✅ **Service announcements** section for operational updates
- ✅ **Mobile-responsive** design for access anywhere
- ✅ **Visual weather graphics** with icons and color-coded alerts
- ✅ **Large-format TV display option** for monitor viewing

---

## 🔗 Quick Links

- [View Main Dashboard](dashboard.html)
- [View Simplified Dashboard](dashboard5.html)
- [View Quick View Dashboard](quick.html)
- [View Demo Scenarios](documentation/demo.html)
- [Read Documentation](documentation/)
- [GitHub Repository](https://github.com/CenterForDigitalHumanities/aviation-dashboard)

---

## ℹ️ About

This dashboard was developed for the **Saint Louis University Oliver L. Parks Department of Aviation Science** to provide clear, real-time flight restriction information based on current weather conditions.

The system automatically evaluates wind speed, crosswind components, visibility, cloud ceilings, heat index, and temperature against established safety thresholds to determine operational status.

---

**Last Updated:** October 9, 2025  
**Questions?** Contact the SLU Aviation Science Department

