# SLU Aviation Dashboard Specification

## Overview

The SLU Aviation Dashboard is a web-based application designed to provide real-time data for aviation operations at Saint Louis University. The primary function of this dashboard is to align METAR reports with flight restrictions for different classes of pilots and aircraft. The visualization should be simple to interpret and provide actionable insights.

## Weather Data

Live weather data is fetched every 15 minutes by a GitHub Actions workflow and published to a public GitHub Gist. The frontend loads weather data directly from the Gist raw URL:

```
https://gist.githubusercontent.com/cubap/8559048ba1cac126b5eb03e56309e73f/raw/weather-data.json
```

This avoids CORS restrictions that apply to `raw.githubusercontent.com`. The Gist is updated using the `WEATHER_PAT` repository secret — a GitHub Personal Access Token with the **`gist`** scope. See [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) for full setup and maintenance instructions.

## Features

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
