# Quick Start: Setting Up the Weather Fetcher

## TL;DR

You need to create a **separate GitHub repository** that automatically fetches weather data and commits it to this repo every 15 minutes.

## Why?

CORS (Cross-Origin Resource Sharing) policies prevent browsers from directly fetching METAR data from NOAA servers. The solution: fetch the data server-side using GitHub Actions and store it in a JSON file that the dashboard can read without CORS issues.

## Step-by-Step Setup

### 1. Create the Weather Fetcher Repository

```bash
# On GitHub, create a new repository called: aviation-weather-fetcher
# Or use any name you prefer
```

### 2. Add These Files to the New Repo

**`.github/workflows/fetch-weather.yml`**
```yaml
name: Fetch Weather Data

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  fetch-and-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - run: npm install
      - run: node fetch-weather.js
        
      - uses: actions/checkout@v3
        with:
          repository: CenterForDigitalHumanities/aviation-dashboard
          token: ${{ secrets.TARGET_REPO_TOKEN }}
          path: aviation-dashboard
          
      - run: |
          mkdir -p aviation-dashboard/data
          cp weather-data.json aviation-dashboard/data/weather-data.json
          cd aviation-dashboard
          git config user.name "Weather Bot"
          git config user.email "weather-bot@github.com"
          git add data/weather-data.json
          git diff --quiet && git diff --staged --quiet || git commit -m "Update weather data"
          git push
```

**`package.json`**
```json
{
  "name": "aviation-weather-fetcher",
  "version": "1.0.0",
  "dependencies": {
    "node-fetch": "^2.6.7"
  }
}
```

**`fetch-weather.js`**
```javascript
// Copy the fetch-weather.js file from this repository
```

### 3. Create a GitHub Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Click "Generate new token" (classic)
3. Give it a name like "Weather Fetcher Bot"
4. Select scope: **`repo`** (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### 4. Add Secret to Weather Fetcher Repo

1. Go to your `aviation-weather-fetcher` repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `TARGET_REPO_TOKEN`
5. Value: Paste the token from step 3
6. Click "Add secret"

### 5. Enable GitHub Actions

1. Go to the Actions tab in `aviation-weather-fetcher`
2. Click "I understand my workflows, go ahead and enable them"
3. Manually trigger the workflow to test it

### 6. Verify It Works

1. Check the Actions tab for successful runs
2. Look for new commits in the `aviation-dashboard` repository
3. Verify `data/weather-data.json` is being updated
4. Open `dashboard.html` and check the console for "Using pre-fetched weather data from JSON file"

## Testing Locally

You can test the fetcher script locally before deploying:

```bash
cd aviation-weather-fetcher
npm install
node fetch-weather.js
cat weather-data.json
```

## Troubleshooting

### Workflow doesn't run
- Check if GitHub Actions is enabled
- Verify the cron schedule (may take up to 15 minutes for first run)
- Try manual trigger from Actions tab

### Push fails
- Verify `TARGET_REPO_TOKEN` is set correctly
- Ensure the token has `repo` scope
- Check repository name matches in workflow file

### No data in JSON file
- Check workflow logs in Actions tab
- Verify NOAA METAR URLs are accessible
- Test `fetch-weather.js` locally

## Alternative: Manual Updates

If you don't want to set up the automated service, you can manually update `data/weather-data.json` or the dashboard will fall back to OpenWeatherMap API.

## Cost

**FREE!** GitHub Actions provides 2,000 free minutes per month. This workflow uses about 5 minutes per month.

## More Details

See `WEATHER_FETCHER_SETUP.md` for comprehensive documentation.
