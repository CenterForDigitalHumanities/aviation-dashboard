# Weather Data Fetcher Service for Aviation Dashboard

This service fetches METAR data from NOAA and commits it to the aviation-dashboard repository every 15 minutes.

## Architecture

This repository solves the CORS issue by running server-side fetches via GitHub Actions:

1. **GitHub Action** runs every 15 minutes
2. **Fetches** METAR data from NOAA servers (KCPS and KSTL)
3. **Parses** the METAR data into JSON format
4. **Commits** the data to the `aviation-dashboard` repository
5. **Dashboard** reads the JSON file directly (no CORS issues)

## Setup Instructions

### 1. Create the Weather Fetcher Repository

Create a new GitHub repository called `aviation-weather-fetcher`.

### 2. Add GitHub Secrets

In the `aviation-weather-fetcher` repository settings, add the following secrets:

- `TARGET_REPO_TOKEN`: A GitHub Personal Access Token with `repo` permissions
  - Go to GitHub Settings → Developer settings → Personal access tokens
  - Create a token with `repo` scope
  - Use this token to push to the aviation-dashboard repo

### 3. Repository Structure

```
aviation-weather-fetcher/
├── .github/
│   └── workflows/
│       └── fetch-weather.yml
├── fetch-weather.js
├── package.json
└── README.md
```

### 4. Files to Create

#### `.github/workflows/fetch-weather.yml`
```yaml
name: Fetch Weather Data

on:
  schedule:
    # Runs every 15 minutes
    - cron: '*/15 * * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  fetch-and-commit:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout weather fetcher repo
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Fetch weather data
        run: node fetch-weather.js
        
      - name: Checkout target repository
        uses: actions/checkout@v3
        with:
          repository: CenterForDigitalHumanities/aviation-dashboard
          token: ${{ secrets.TARGET_REPO_TOKEN }}
          path: aviation-dashboard
          
      - name: Copy weather data to target repo
        run: |
          mkdir -p aviation-dashboard/data
          cp weather-data.json aviation-dashboard/data/weather-data.json
          
      - name: Commit and push to target repo
        run: |
          cd aviation-dashboard
          git config user.name "Weather Bot"
          git config user.email "weather-bot@github.com"
          git add data/weather-data.json
          git diff --quiet && git diff --staged --quiet || git commit -m "Update weather data - $(date -u +%Y-%m-%dT%H:%M:%SZ)"
          git push
```

#### `package.json`
```json
{
  "name": "aviation-weather-fetcher",
  "version": "1.0.0",
  "description": "Fetches METAR data for aviation dashboard",
  "main": "fetch-weather.js",
  "scripts": {
    "fetch": "node fetch-weather.js"
  },
  "dependencies": {
    "node-fetch": "^2.6.7"
  }
}
```

#### `fetch-weather.js`
See the separate file created for this script.

## How It Works

1. **Scheduled Execution**: GitHub Actions triggers every 15 minutes
2. **Server-Side Fetch**: Node.js fetches METAR data from NOAA (no browser CORS)
3. **Data Parsing**: Extracts wind, temperature, visibility, ceiling from METAR
4. **JSON Generation**: Creates structured JSON with parsed data
5. **Cross-Repo Commit**: Pushes data to aviation-dashboard repository
6. **Dashboard Consumption**: Dashboard reads JSON file directly via fetch

## Benefits

- ✅ **No CORS Issues**: Server-side fetching bypasses browser restrictions
- ✅ **Reliable Data**: Direct NOAA access without proxy dependencies
- ✅ **Automatic Updates**: Runs every 15 minutes without manual intervention
- ✅ **Cached Data**: Dashboard can work even if NOAA is temporarily down
- ✅ **Version Control**: Weather data changes are tracked in git history
- ✅ **Free Hosting**: GitHub Actions provides free compute time

## Manual Trigger

You can manually trigger a weather update:
1. Go to the Actions tab in the weather-fetcher repository
2. Select "Fetch Weather Data" workflow
3. Click "Run workflow"

## Monitoring

- Check GitHub Actions logs for fetch status
- Review commit history in aviation-dashboard for update frequency
- Monitor for failed workflows and fix issues

## Cost

- **GitHub Actions**: Free tier includes 2,000 minutes/month
- **This workflow**: Uses ~5 minutes/month (15 sec × 4 runs/hour × 24 hours × 30 days)
- **Total cost**: $0 (well within free tier)
