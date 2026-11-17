#!/usr/bin/env bash
# Publish the organic Page posts listed in posts.json.
#
# Requires the system user token to carry pages_manage_posts; without it Meta
# answers (#200) ... requires pages_manage_posts.
#
#   ./publish-posts.sh now     # publish the first post, schedule the rest daily
#   ./publish-posts.sh all     # publish every post immediately
#   ./publish-posts.sh check   # permissions only, publishes nothing
#
set -euo pipefail
cd "$(dirname "$0")"

PAGE_ID="979562428571695"
GRAPH="https://graph.facebook.com/v23.0"
MODE="${1:-check}"

TOKEN="$(grep '^ACCESS_TOKEN' .env | sed 's/^ACCESS_TOKEN=//' | tr -d '"'"'"'')"
if [ -z "$TOKEN" ]; then
  echo "✗ ACCESS_TOKEN missing from .env"; exit 1
fi

echo "── permissions ─────────────────────────────────────────"
SCOPES="$(curl -s --max-time 20 "$GRAPH/debug_token?input_token=$TOKEN&access_token=$TOKEN" | jq -r '.data.scopes[]?' | tr '\n' ' ')"
echo "  scopes: $SCOPES"
if ! echo "$SCOPES" | grep -q "pages_manage_posts"; then
  echo
  echo "✗ pages_manage_posts is NOT granted on this token."
  echo "  Regenerate: Business settings → Users → System users → Generate new token"
  echo "  → app RaikanBersamaxyz → tick pages_manage_posts → update .env"
  exit 2
fi
echo "  ✓ pages_manage_posts granted"

PAGE_TOKEN="$(curl -s --max-time 20 "$GRAPH/me/accounts?fields=id,access_token&access_token=$TOKEN" \
  | jq -r --arg p "$PAGE_ID" '.data[]? | select(.id==$p) | .access_token')"
if [ -z "$PAGE_TOKEN" ]; then
  echo "✗ no page access token for $PAGE_ID"; exit 1
fi
echo "  ✓ page token acquired"

if [ "$MODE" = "check" ]; then
  echo "── check only — nothing published ──────────────────────"
  exit 0
fi

echo "── publishing ──────────────────────────────────────────"
OUT="posts-published.json"
echo "[" > "$OUT"
FIRST=1
N=0
for row in $(jq -r '.[] | @base64' posts.json); do
  _j() { echo "$row" | base64 -d | jq -r "$1"; }
  SLOT="$(_j '.slot')"
  ASSET="$(_j '.asset')"
  CAPTION="$(_j '.caption')"
  N=$((N + 1))

  if [ ! -f "$ASSET" ]; then
    echo "  ✗ $SLOT: asset missing ($ASSET)"; continue
  fi

  if [ "$MODE" = "now" ] && [ "$N" -gt 1 ]; then
    # schedule remaining posts one per day at 19:00 MYT (UTC+8)
    SCHEDULE_TS=$(python3 -c "
import datetime
d = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))) + datetime.timedelta(days=$N-1)
d = d.replace(hour=19, minute=0, second=0, microsecond=0)
print(int(d.timestamp()))
")
    RESP="$(curl -s --max-time 300 -X POST "$GRAPH/$PAGE_ID/videos" \
      -F "source=@$ASSET" \
      -F "description=$CAPTION" \
      -F "published=false" \
      -F "scheduled_publish_time=$SCHEDULE_TS" \
      -F "access_token=$PAGE_TOKEN")"
  else
    RESP="$(curl -s --max-time 300 -X POST "$GRAPH/$PAGE_ID/videos" \
      -F "source=@$ASSET" \
      -F "description=$CAPTION" \
      -F "published=true" \
      -F "access_token=$PAGE_TOKEN")"
  fi

  VID="$(echo "$RESP" | jq -r '.id // empty' 2>/dev/null || true)"
  if [ -n "$VID" ]; then
    SCOPED="$(echo "$RESP" | sed "s|$PAGE_TOKEN|***|g" | jq -r 'if .post_id then .post_id else "scheduled" end')"
    echo "  ✓ $SLOT → video $VID ($SCOPED)"
    if [ "$FIRST" -eq 0 ]; then echo "," >> "$OUT"; fi
    FIRST=0
    printf '  {"slot":"%s","video_id":"%s","asset":"%s"}' "$SLOT" "$VID" "$ASSET" >> "$OUT"
  else
    echo "  ✗ $SLOT failed: $(echo "$RESP" | sed "s|$PAGE_TOKEN|***|g" | head -c 300)"
  fi
done
echo "]" >> "$OUT"
echo "── done ── ids in $OUT"
