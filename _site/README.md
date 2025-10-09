# SLU Aviation Dashboard

Real-time weather conditions and flight restrictions dashboard for Saint Louis University Oliver L. Parks Department of Aviation Science.

## Features

- **Current Flight Status**: Simplified concentric restriction model showing the most restrictive flight level
- **Service Announcements**: Important updates and notifications
- **Live METAR Data**: Current weather from KCPS and KSTL airports
- **Pilot Restrictions**: Wind, visibility, ceiling, and crosswind restrictions
- **Heat Index Restrictions**: Temperature-based flight limitations
- **Auto-Refresh**: Updates every 5 minutes

## Flight Status Levels

1. **All Pilots Clear** (Green) - No weather restrictions
2. **Private+ Only** (Orange) - Student pilots restricted (winds ≥20kt or crosswind >10kt)
3. **Commercial/Instrument Only** (Yellow) - Student & Private pilots restricted (winds ≥25kt or crosswind >15kt)
4. **All Flights Restricted** (Red) - All operations restricted (winds ≥30kt, crosswind >20kt, ceiling <1500ft, or visibility <3SM)

## Weather Data Architecture

To work around CORS restrictions, this project uses a **two-repository architecture**:

### Repository 1: `aviation-weather-fetcher` (Separate Repo - RECOMMENDED)
- GitHub Actions workflow runs every 15 minutes
- Fetches METAR data from NOAA servers (server-side, no CORS)
- Parses METAR into structured JSON
- Commits `weather-data.json` to this repository

### Repository 2: `aviation-dashboard` (This Repo)
- Hosts the dashboard HTML files
- Reads weather data from `data/weather-data.json`
- No CORS issues since it's reading from the same domain
- Fallback to OpenWeatherMap API if JSON data is unavailable

**See `WEATHER_FETCHER_SETUP.md` for complete setup instructions.**

## Files

- `dashboard.html` - Main operational dashboard
- `dashboard5.html` - Alternative dashboard version
- `demo.html` - Demo page showing all possible status scenarios
- `data/weather-data.json` - Pre-fetched weather data (updated every 15 minutes)
- `fetch-weather.js` - Weather data fetcher script (for separate repo)
- `WEATHER_FETCHER_SETUP.md` - Complete setup instructions for weather data service

## Original Specification

1. **Pilot Profiles**
   - Display constraints such as cloud ceiling, visibility, and wind across different classes of pilots.
   - Initially include Student Pilot Solo, Private Pilot Solo, and Instrument/Commercial Pilot Solo.
   - Enable an administrator to manage pilot profiles and update their constraints as needed.

2. **Data Gathering and Interpretation**
   - Automatically connect to METAR data sources to fetch real-time weather information.
   - Interpret METAR reports and correlate them with pilot and aircraft constraints.
   - Include both St. Louis Downtown Airport (KCPS) and St. Louis Lambert International Airport (KSTL).

3. **Configuration Management**
   - Enable an administrator to manage system configurations, including weather data sources, alert thresholds, and pilot profiles.

4. **Data Visualization**
   - Provide a user-friendly interface to visualize weather data and flight restrictions.
   - Follow standard data visualization practices to ensure clarity and effectiveness.
   - Align as closely as possible with existing aviation UX principles.

5. **Reporting and Analytics**
   - Preserve some historical data for trend analysis and reporting purposes.

## Technical Requirements

- The dashboard will be built using modern web technologies, preferring static site generation for portability.
- No private or confidential data will be gathered or stored.
- The application will be built for hosting on a Raspberry Pi or static site such as GitHub Pages.
- No API services or additional hooks are indicated in this first implementation.

## User Interface Design

- The UI will be designed with a focus on usability and accessibility, following best practices for web design.
- Design will focus on the specific display scenarios anticipated, but will remain flexible for future applications.

## Implementation Timeline

1. **Phase 1: Requirements Gathering**
   - Conduct interviews with stakeholders to gather detailed requirements.
   - Create user personas and use cases to guide the design process.

2. **Phase 2: Design**
   - Develop wireframes and prototypes for the dashboard UI.
   - Review designs with stakeholders and incorporate feedback.

3. **Phase 3: Development**
   - Set up the development environment and infrastructure.
   - Implement the frontend and backend components of the dashboard.

4. **Phase 4: Iteration**
   - Respond to testing, bugs, and user feedback to improve the application.
   - Implement additional features and enhancements based on user needs and available resources.

5. **Phase 5: Deployment**
   - Deploy the application to the production environment.
   - Provide training and documentation for end-users.

## Conclusion

The SLU Aviation Dashboard will be a valuable tool for enhancing the efficiency and effectiveness of aviation instruction at Saint Louis University. By providing real-time data and analytics, the dashboard will enable better decision-making and improved performance.
