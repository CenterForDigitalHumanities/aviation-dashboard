# GitHub Actions Weather Updater Setup

## Overview
This setup uses GitHub Actions to automatically fetch METAR weather data every 15 minutes and commit it to the repository.

## File Structure
```
aviation-dashboard/
├── .github/
│   └── workflows/
│       └── update-weather.yml       # GitHub Actions workflow
├── scripts/
│   └── fetch-weather.py             # Weather fetcher script (Python)
├── data/
│   └── weather-data.json            # Updated every 15 minutes by Actions
├── dashboard.html                   # Main dashboard (reads from data/weather-data.json)
└── dashboard5.html                  # Alternative dashboard
```

## How It Works

### 1. GitHub Actions Workflow
- **Trigger**: Runs every 15 minutes (cron: `*/15 * * * *`)
- **Manual Trigger**: Can be manually triggered from the Actions tab
- **Push Trigger**: Runs when workflow or fetch-weather.js is updated

### 2. Weather Fetcher Script (`scripts/fetch-weather.py`)
- Fetches METAR data from NOAA for KCPS and KSTL
- Parses METAR text into structured JSON
- Extracts: wind, visibility, temperature, dew point, clouds, altimeter
- Outputs to `weather-data.json`
- **Uses Python** (pre-installed on GitHub Actions runners, no dependencies needed)

### 3. Data Storage (`data/weather-data.json`)
- Updated automatically by GitHub Actions
- Contains parsed METAR data for both airports
- Includes timestamp of last update

### 4. Dashboard Integration
- Dashboards read from `data/weather-data.json` first
- Falls back to direct API calls if needed
- Displays current weather and flight restrictions

## Setup Steps

### Initial Commit
1. Commit all the new files to your repository:
   ```powershell
   git add .github/workflows/update-weather.yml
   git add scripts/fetch-weather.py
   git add data/weather-data.json
   git commit -m "Add GitHub Actions weather updater (Python)"
   git push origin gh-actions-timer
   ```

### Enable GitHub Actions
1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. If Actions are disabled, click "I understand my workflows, go ahead and enable them"

### Manual First Run
1. Go to Actions tab
2. Click "Update Weather Data" workflow
3. Click "Run workflow" dropdown
4. Click the green "Run workflow" button
5. Watch the workflow run (should take about 30 seconds)
6. Check that `data/weather-data.json` was updated with real data

### Verify Automatic Updates
1. Wait 15 minutes
2. Check the Actions tab for a new workflow run
3. Verify `data/weather-data.json` has new data
4. Check the commit history to see automated commits

## Testing Locally (Optional)

If you have Python 3 installed locally:
```powershell
cd scripts
python fetch-weather.py
```

This will create `weather-data.json` in the scripts directory (which you can then copy to data/).

## Monitoring

### Check Workflow Status
- Go to Actions tab to see all runs
- Click on any run to see detailed logs
- Failed runs will send notifications (if configured)

### Check Data Updates
- View `data/weather-data.json` on GitHub
- Check the "lastUpdated" timestamp
- View commit history for automated updates

### View Logs
Each workflow run shows:
- METAR URLs being fetched
- Parsed METAR data
- Success/failure status
- Git commit results

## Troubleshooting

### No Updates Happening
1. Check Actions tab for errors
2. Verify workflow file syntax
3. Check repository permissions (Actions needs write access)

### Invalid Data
1. Check workflow logs for METAR fetch errors
2. Verify NOAA URLs are still correct
3. Check parsing logic in fetch-weather.py

### Dashboard Not Updating
1. Clear browser cache
2. Check browser console for errors
3. Verify data/weather-data.json exists and has recent timestamp
4. Check dashboard.html is reading from correct path

## Customization

### Change Update Frequency
Edit `.github/workflows/update-weather.yml`:
```yaml
schedule:
  - cron: '*/5 * * * *'  # Every 5 minutes
  - cron: '0 * * * *'     # Every hour
  - cron: '0 */2 * * *'   # Every 2 hours
```

### Add More Airports
Edit `scripts/fetch-weather.py`:
1. Add new URL constant
2. Fetch the METAR
3. Parse and add to output data
4. Update dashboard to display new airport

### Modify Data Structure
Edit the `output_data` dictionary in `scripts/fetch-weather.py` to include additional fields or change formatting.

## Benefits of This Approach

✅ **No CORS Issues**: Server-side fetching bypasses browser restrictions  
✅ **Free**: GitHub Actions provides generous free tier  
✅ **Reliable**: GitHub's infrastructure handles scheduling  
✅ **Transparent**: All updates visible in commit history  
✅ **Simple**: Single repository, no external services  
✅ **Fast**: Dashboards load pre-fetched data instantly  

## Next Steps

After pushing these changes:
1. ✅ Enable GitHub Actions
2. ✅ Run workflow manually for first update
3. ✅ Verify dashboard displays correct data
4. ✅ Monitor for 1 hour to ensure automatic updates work
5. ✅ Merge gh-actions-timer branch into main when satisfied
