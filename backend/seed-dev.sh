#!/bin/sh
set -e

BASE="${BASE:-http://localhost:5000}"

echo "Creating demo user..."
USER=$(curl -sf -X POST "$BASE/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "name": "Demo User",
    "password": "demo1234",
    "ntfy_topic": "demo-notifications"
  }')

USER_ID=$(echo "$USER" | grep -o '"user_id":"[^"]*"' | cut -d'"' -f4)
echo "Created user: $USER_ID"

echo "Creating demo briefing..."
curl -sf -X POST "$BASE/internal/briefings" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"full_summary\": \"Markets closed mixed on Wednesday as investors weighed stronger-than-expected earnings from the tech sector against persistent inflation concerns. The S&P 500 edged up 0.3%, led by gains in AAPL (+1.8%) and MSFT (+2.1%) following upbeat guidance. NVDA pulled back 1.2% after a three-day rally amid profit-taking. Energy stocks lagged as crude oil slipped below \$80/bbl on demand worries out of China. The Fed's Beige Book signalled continued cooling in the labor market, reinforcing expectations of a pause at the next FOMC meeting. Treasury yields ticked down slightly, with the 10-year settling at 4.42%.\",
    \"short_summary\": \"S&P 500 +0.3% on strong tech earnings (AAPL +1.8%, MSFT +2.1%). NVDA dipped 1.2%. Energy lagged on oil weakness. Fed Beige Book supports rate-pause expectations.\",
    \"sources\": [
      { \"ticker\": \"AAPL\", \"title\": \"Apple beats Q2 estimates, raises guidance\", \"url\": \"https://example.com/aapl-earnings\" },
      { \"ticker\": \"MSFT\", \"title\": \"Microsoft cloud revenue surges 23% YoY\", \"url\": \"https://example.com/msft-cloud\" },
      { \"ticker\": \"NVDA\", \"title\": \"Nvidia pulls back after three-day run\", \"url\": \"https://example.com/nvda-pullback\" }
    ]
  }"

echo ""
echo "Done. Demo user: demo / demo1234"
