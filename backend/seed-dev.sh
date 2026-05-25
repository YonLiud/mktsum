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

COOKIE_JAR=$(mktemp)
echo "Logging in..."
curl -sf -c "$COOKIE_JAR" -X POST "$BASE/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo1234"}' > /dev/null

echo "Adding tickers to watchlist..."
curl -sf -b "$COOKIE_JAR" -X POST "$BASE/v1/watchlist/user/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"tickers": ["AAPL", "MSFT", "NVDA", "TSLA"]}' > /dev/null

echo "Creating briefing 1 (today)..."
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
  }" > /dev/null

echo "Creating briefing 2..."
curl -sf -X POST "$BASE/internal/briefings" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"created_at\": \"$(date -d '1 day ago' '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -v-1d '+%Y-%m-%dT%H:%M:%SZ')\",
    \"full_summary\": \"Tesla shares surged 4.7% on Tuesday after the company reported record deliveries in Q1, beating analyst estimates by a wide margin. CEO Elon Musk reiterated full-year guidance and hinted at new model announcements at the upcoming shareholder meeting. Meanwhile, AAPL gave back some gains following reports of weaker iPhone demand in China, falling 0.9%. MSFT held steady ahead of its earnings release scheduled for after-hours Thursday. Broader market sentiment was cautiously optimistic, with the Nasdaq composite up 0.6%.\",
    \"short_summary\": \"TSLA +4.7% on record deliveries beat. AAPL -0.9% on China demand concerns. MSFT flat ahead of earnings. Nasdaq +0.6%.\",
    \"sources\": [
      { \"ticker\": \"TSLA\", \"title\": \"Tesla Q1 deliveries smash estimates\", \"url\": \"https://example.com/tsla-deliveries\" },
      { \"ticker\": \"AAPL\", \"title\": \"iPhone demand softens in China market\", \"url\": \"https://example.com/aapl-china\" },
      { \"ticker\": \"MSFT\", \"title\": \"Microsoft earnings preview: cloud in focus\", \"url\": \"https://example.com/msft-preview\" }
    ]
  }" > /dev/null

echo "Creating briefing 3..."
curl -sf -X POST "$BASE/internal/briefings" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"full_summary\": \"Nvidia dominated headlines Monday after announcing its next-generation Blackwell Ultra GPU architecture at GTC, sending shares up 6.2%. The announcement reinforced investor confidence in sustained AI infrastructure spending. MSFT climbed 1.4% after its Azure division reported 29% growth in a pre-earnings data release. TSLA remained under pressure, declining 2.1% as margin concerns resurfaced following a competitive pricing move by BYD in the European market. The S&P 500 gained 0.8% overall, with semiconductor stocks leading broad-based gains.\",
    \"short_summary\": \"NVDA +6.2% on Blackwell Ultra reveal. MSFT +1.4% on Azure growth data. TSLA -2.1% on BYD pricing pressure. S&P 500 +0.8%.\",
    \"sources\": [
      { \"ticker\": \"NVDA\", \"title\": \"Nvidia unveils Blackwell Ultra at GTC\", \"url\": \"https://example.com/nvda-gtc\" },
      { \"ticker\": \"MSFT\", \"title\": \"Azure growth accelerates to 29%\", \"url\": \"https://example.com/msft-azure\" },
      { \"ticker\": \"TSLA\", \"title\": \"BYD cuts prices in Europe, pressuring Tesla\", \"url\": \"https://example.com/byd-europe\" }
    ]
  }" > /dev/null

echo "Creating briefing 4..."
curl -sf -X POST "$BASE/internal/briefings" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"full_summary\": \"A broad risk-off session unfolded last Friday as hotter-than-expected CPI data rattled equity markets. The S&P 500 fell 1.1% and the Nasdaq dropped 1.6%, with rate-sensitive tech names taking the brunt of the selloff. AAPL shed 2.3% and NVDA lost 3.1%. MSFT declined 1.5% despite no company-specific news. TSLA bucked the trend, edging up 0.4% on no major catalyst — analysts attributed it to short covering. The 10-year Treasury yield jumped to 4.61%, its highest level since November, as traders repriced rate-cut expectations toward just one cut in 2025.\",
    \"short_summary\": \"Hot CPI triggers selloff: S&P -1.1%, Nasdaq -1.6%. AAPL -2.3%, NVDA -3.1%, MSFT -1.5%. 10-year yield spikes to 4.61%. TSLA +0.4% on short covering.\",
    \"sources\": [
      { \"ticker\": \"AAPL\", \"title\": \"Tech stocks lead market lower on CPI shock\", \"url\": \"https://example.com/cpi-selloff\" },
      { \"ticker\": \"NVDA\", \"title\": \"Nvidia drops 3% as rate fears resurface\", \"url\": \"https://example.com/nvda-rates\" },
      { \"ticker\": \"TSLA\", \"title\": \"Tesla holds up amid broad market weakness\", \"url\": \"https://example.com/tsla-resilient\" }
    ]
  }" > /dev/null

rm -f "$COOKIE_JAR"
echo ""
echo "Done. Demo credentials: demo / demo1234"
