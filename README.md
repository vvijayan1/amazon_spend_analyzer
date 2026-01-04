# Amazon Purchase History Analyzer (Frontend-Only)

A privacy-first, client-side web app to analyze your Amazon retail order history CSV. All processing is done in-browser; no data leaves your device.

## Features
- Upload your Amazon retail order history CSV
- Filter by year range
- Interactive charts:
  - Total spend by year
  - Spend by month
  - Purchases by day of week (count, not value)
- Top 5 highest and lowest-value purchases
- Currency display matches the currency with the most purchases
- No data storage, export, or backend

## How to Use Yourself Locally
1. Open `index.html` in your browser (double-click or use a local server)
2. Upload your Amazon CSV file
3. Explore your spending patterns interactively

## How to use the Hosted Version (does not store data)
Click [here] (https://vvijayan1.github.io/amazon_spend_analyzer/) to access the hosted version of the app.

## Privacy
- No data leaves your browser
- No cookies, localStorage, or IndexedDB
- Data is held only in memory and cleared on refresh

## Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- Your Amazon retail order history CSV
