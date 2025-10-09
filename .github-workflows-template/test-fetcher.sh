#!/bin/bash

# Test Script for Weather Fetcher Setup
# This script helps verify that the weather fetcher is working correctly

echo "======================================"
echo "Aviation Weather Fetcher - Test Script"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "fetch-weather.js" ]; then
    echo "❌ Error: fetch-weather.js not found"
    echo "   Please run this script from the aviation-weather-fetcher directory"
    exit 1
fi

echo "✓ Found fetch-weather.js"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✓ npm is installed: $(npm --version)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

echo "✓ Found package.json"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"

# Run the weather fetcher
echo ""
echo "Fetching weather data..."
node fetch-weather.js

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to fetch weather data"
    exit 1
fi

echo "✓ Weather data fetched successfully"

# Check if weather-data.json was created
if [ ! -f "weather-data.json" ]; then
    echo "❌ Error: weather-data.json was not created"
    exit 1
fi

echo "✓ Created weather-data.json"

# Display the weather data
echo ""
echo "======================================"
echo "Weather Data Preview:"
echo "======================================"
cat weather-data.json | head -20
echo "..."
echo ""

# Summary
echo "======================================"
echo "✅ All tests passed!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Review the weather-data.json file"
echo "2. Set up GitHub Actions in your repository"
echo "3. Add the TARGET_REPO_TOKEN secret"
echo "4. Test the GitHub Actions workflow"
echo ""
echo "See QUICK_START.md for detailed instructions."
