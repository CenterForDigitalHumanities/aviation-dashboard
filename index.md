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

### [Quick View Dashboard](quick.html)
Large-format TV display dashboard with weather graphics, flight status, announcements, and METAR data. Optimized for monitor viewing.

### [Mobile Status](mobile.html)
Smartphone-optimized single-page view with the current flight category card, temperature/heat index notes, and a bottom navigation menu for Announcements, METAR + Conditions, and the full Restrictions breakdown. Supports persistent system notifications via the Web Notification API.

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

<table style="border-collapse:collapse; width:100%; font-size:0.9em; text-align:center;">
  <thead>
    <tr>
      <th colspan="7" style="background:#1a1a1a; color:#fff; padding:8px; border:1px solid #ccc; letter-spacing:0.06em; text-transform:uppercase;">Weather Restrictions to Flight Operations</th>
    </tr>
    <tr>
      <th style="border:1px solid #ccc; padding:6px;"></th>
      <th style="border:1px solid #ccc; padding:6px;"></th>
      <th style="border:1px solid #ccc; padding:6px;"></th>
      <th style="border:1px solid #ccc; padding:6px;"></th>
      <th colspan="3" style="border:1px solid #ccc; padding:6px; background:#f0f0f0; font-weight:700;">Pilot Certificate Level</th>
    </tr>
    <tr style="background:#f0f0f0;">
      <th style="border:1px solid #ccc; padding:6px;">Category</th>
      <th style="border:1px solid #ccc; padding:6px;">Ceiling</th>
      <th style="border:1px solid #ccc; padding:6px;">Visibility</th>
      <th style="border:1px solid #ccc; padding:6px;">Crosswind Component /<br>Wind Speed (kt)</th>
      <th style="border:1px solid #ccc; padding:6px;">Student<br>Pilot</th>
      <th style="border:1px solid #ccc; padding:6px;">Private<br>Pilot</th>
      <th style="border:1px solid #ccc; padding:6px;">Instrument /<br>Commercial Pilot</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #ccc; padding:8px; background:#548235; color:#fff; font-weight:900; font-size:1.3em;">A</td>
      <td style="border:1px solid #ccc; padding:8px;">At least 1,500 ft</td>
      <td style="border:1px solid #ccc; padding:8px;">At least 3 SM</td>
      <td style="border:1px solid #ccc; padding:8px;">&le; 10 &amp;&amp; &lt; 20</td>
      <td style="border:1px solid #ccc; padding:8px;">No Restrictions</td>
      <td style="border:1px solid #ccc; padding:8px;">No Restrictions</td>
      <td style="border:1px solid #ccc; padding:8px;">No Restrictions</td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc; padding:8px; background:#ffff00; color:#5a5a00; font-weight:900; font-size:1.3em;">B</td>
      <td style="border:1px solid #ccc; padding:8px;">At least 1,500 ft</td>
      <td style="border:1px solid #ccc; padding:8px;">At least 3 SM</td>
      <td style="border:1px solid #ccc; padding:8px;">11–15 or 20–24</td>
      <td style="border:1px solid #ccc; padding:8px; background:#fff3cd;">No Solo</td>
      <td style="border:1px solid #ccc; padding:8px;">No Restrictions</td>
      <td style="border:1px solid #ccc; padding:8px;">No Restrictions</td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc; padding:8px; background:#ed7d31; color:#fff; font-weight:900; font-size:1.3em;">C</td>
      <td style="border:1px solid #ccc; padding:8px;">At least 1,500 ft</td>
      <td style="border:1px solid #ccc; padding:8px;">At least 3 SM</td>
      <td style="border:1px solid #ccc; padding:8px;">16–20 or 25–29</td>
      <td style="border:1px solid #ccc; padding:8px; background:#fff3cd;">No Solo</td>
      <td style="border:1px solid #ccc; padding:8px; background:#fff3cd;">No Solo</td>
      <td style="border:1px solid #ccc; padding:8px;">No Restrictions</td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc; padding:8px; background:#ff0000; color:#fff; font-weight:900; font-size:1.3em;">D</td>
      <td style="border:1px solid #ccc; padding:8px;">Less than 1,500 ft</td>
      <td style="border:1px solid #ccc; padding:8px;">Less than 3 SM</td>
      <td style="border:1px solid #ccc; padding:8px;">&gt; 20 or &ge; 30</td>
      <td style="border:1px solid #ccc; padding:8px; background:#fff3cd;">No Solo</td>
      <td style="border:1px solid #ccc; padding:8px; background:#fff3cd;">No Solo</td>
      <td style="border:1px solid #ccc; padding:8px; background:#fff3cd;">No Solo</td>
    </tr>
    <tr>
      <td style="border:1px solid #ccc; padding:8px; background:#1a1a1a; color:#fff; font-weight:900; font-size:1.3em;">F</td>
      <td colspan="6" style="border:1px solid #ccc; padding:8px; background:#1a1a1a; color:#fff; letter-spacing:0.15em; font-weight:700;">— — — — — — — — — — No Flights — — — — — — — — — —</td>
    </tr>
  </tbody>
</table>

---

## 📊 Key Features

- ✅ **Real-time METAR data** from NOAA Aviation Weather Center
- ✅ **Automatic updates** every 5 minutes on dashboards
- ✅ **Visual weather graphics** with icons and color-coded alerts
- ✅ **Crosswind calculations** for Runway 12/30
- ✅ **Heat index calculations** with relative humidity
- ✅ **Concentric restriction model** for clear decision-making
- ✅ **Temperature restrictions** for both extreme heat and cold
- ✅ **Service announcements** section for operational updates
- ✅ **Large-format TV display** option for monitor viewing
- ✅ **Mobile-responsive** design for access anywhere

---

## 🔗 Quick Links

- [View Main Dashboard](dashboard.html)
- [View Quick View Dashboard](quick.html)
- [View Demo Scenarios](documentation/demo.html)
- [Read Documentation](documentation/)
- [GitHub Repository](https://github.com/CenterForDigitalHumanities/aviation-dashboard)

---

## ℹ️ About

This dashboard was developed for the **Saint Louis University Oliver L. Parks Department of Aviation Science** to provide clear, real-time flight restriction information based on current weather conditions.

The system automatically evaluates wind speed, crosswind components, visibility, cloud ceilings, heat index, and temperature against established safety thresholds to determine operational status.

---

**Last Updated:** March 2026  
**Questions?** Contact the SLU Aviation Science Department

