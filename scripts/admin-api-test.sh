#!/usr/bin/env bash
# Tests all /api/v1/admin/* endpoints as ADMIN with mock payloads.
# Usage: ./scripts/admin-api-test.sh [BASE_URL]

set -euo pipefail

BASE="${1:-http://localhost:4100}"
API="$BASE/api/v1"
PASS=0
FAIL=0
ADMIN_TOKEN=""
LAST_CODE=""
LAST_BODY=""

log() { printf '\n━━━ %s ━━━\n' "$1"; }

run() {
  local method="$1" path="$2"
  shift 2
  local url="$API$path"
  local out
  out="$(mktemp)"
  local auth=()
  [[ -n "$ADMIN_TOKEN" ]] && auth=(-H "Authorization: Bearer $ADMIN_TOKEN")
  LAST_CODE=$(curl -sS -o "$out" -w '%{http_code}' -X "$method" "${auth[@]}" "$url" "$@")
  LAST_BODY="$(cat "$out")"
  rm -f "$out"
}

json_val() {
  printf '%s' "$LAST_BODY" | node -e "
    const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
    const path = process.argv[1].replace(/^\./, '');
    const keys = path.match(/[^.\\[\\]]+|\\[\\d+\\]/g) || [];
    const v = keys.reduce((o, k) => {
      if (o == null) return undefined;
      if (k.startsWith('[')) return o[Number(k.slice(1, -1))];
      return o[k];
    }, data);
    if (v != null && typeof v !== 'object') console.log(String(v));
  " "$1" 2>/dev/null | head -1
}

assert_status() {
  local name="$1" expected="$2"
  if [[ "$LAST_CODE" == "$expected" ]]; then
    printf '  ✓ %-55s %s\n' "$name" "$LAST_CODE"
    PASS=$((PASS + 1))
  else
    printf '  ✗ %-55s expected %s got %s\n' "$name" "$expected" "$LAST_CODE"
    echo "    $(echo "$LAST_BODY" | head -c 400)"
    FAIL=$((FAIL + 1))
  fi
}

log "Admin login"
run POST /auth/login -H 'Content-Type: application/json' \
  -d '{"phone":"01700000001","password":"password123"}'
assert_status "POST /auth/login" 200
ADMIN_TOKEN=$(json_val 'data.token')
ROLE=$(json_val 'data.user.role')
if [[ "$ROLE" != "ADMIN" ]]; then
  echo "  ✗ Admin role expected ADMIN, got: $ROLE"
  exit 1
fi
echo "  → token ok, role=$ROLE"

log "Admin — stops"
run GET /admin/stops
assert_status "GET /admin/stops" 200

CODE="ADM$(date +%s | tail -c 5)"
run POST /admin/stops -H 'Content-Type: application/json' \
  -d "{\"name\":\"Mock Stop\",\"city\":\"MockCity\",\"code\":\"$CODE\"}"
assert_status "POST /admin/stops (mock)" 201
MOCK_STOP_ID=$(json_val 'data.id')

if [[ -n "$MOCK_STOP_ID" ]]; then
  run PATCH "/admin/stops/$MOCK_STOP_ID" -H 'Content-Type: application/json' \
    -d '{"name":"Mock Stop Updated"}'
  assert_status "PATCH /admin/stops/:id" 200

  run DELETE "/admin/stops/$MOCK_STOP_ID"
  assert_status "DELETE /admin/stops/:id" 200
fi

log "Admin — routes"
run GET /admin/routes
assert_status "GET /admin/routes" 200
FROM_ID=$(json_val 'data[0].fromStopId')
TO_ID=$(json_val 'data[0].toStopId')

if [[ -n "$FROM_ID" && -n "$TO_ID" ]]; then
  run POST /admin/routes -H 'Content-Type: application/json' \
    -d "{\"fromStopId\":\"$FROM_ID\",\"toStopId\":\"$TO_ID\"}"
  assert_status "POST /admin/routes (duplicate pair → 409)" 409
fi

log "Admin — coaches"
run GET /admin/coaches
assert_status "GET /admin/coaches" 200
LAYOUT_ID=$(json_val 'data[0].seatLayout.id')

COACH_NUM="MK-$(date +%s | tail -c 6)"
if [[ -n "$LAYOUT_ID" ]]; then
  run POST /admin/coaches -H 'Content-Type: application/json' \
    -d "{\"coachNumber\":\"$COACH_NUM\",\"busType\":\"AC\",\"seatLayoutId\":\"$LAYOUT_ID\"}"
  assert_status "POST /admin/coaches (mock)" 201
else
  run POST /admin/coaches -H 'Content-Type: application/json' \
    -d "{\"coachNumber\":\"$COACH_NUM\",\"busType\":\"NON_AC\"}"
  assert_status "POST /admin/coaches (mock, no layout)" 201
fi

log "Admin — layouts"
run GET /admin/layouts
assert_status "GET /admin/layouts" 200

run POST /admin/layouts -H 'Content-Type: application/json' \
  -d '{
    "name":"Mock 4-seat",
    "rows":2,
    "cols":2,
    "templates":[
      {"label":"M1A","row":1,"col":1,"seatClass":"STANDARD"},
      {"label":"M1B","row":1,"col":2,"seatClass":"STANDARD"},
      {"label":"M2A","row":2,"col":1,"seatClass":"PREMIUM"},
      {"label":"M2B","row":2,"col":2,"seatClass":"BUSINESS"}
    ]
  }'
assert_status "POST /admin/layouts (mock)" 201
MOCK_LAYOUT_ID=$(json_val 'data.id')

log "Admin — schedules"
run GET /admin/schedules
assert_status "GET /admin/schedules" 200
ROUTE_ID=$(json_val 'data[0].routeId')
COACH_ID=$(json_val 'data[0].coachId')
SCHEDULE_ID=$(json_val 'data[0].id')

if [[ -n "$ROUTE_ID" && -n "$COACH_ID" ]]; then
  DEP=$(node -e "const d=new Date();d.setDate(d.getDate()+2);d.setUTCHours(8,0,0,0);console.log(d.toISOString())")
  ARR=$(node -e "const d=new Date();d.setDate(d.getDate()+2);d.setUTCHours(13,0,0,0);console.log(d.toISOString())")
  run POST /admin/schedules -H 'Content-Type: application/json' \
    -d "{\"routeId\":\"$ROUTE_ID\",\"coachId\":\"$COACH_ID\",\"departureAt\":\"$DEP\",\"estimatedArrivalAt\":\"$ARR\",\"baseFare\":90000}"
  assert_status "POST /admin/schedules (mock)" 201
  NEW_SCHEDULE_ID=$(json_val 'data.id')

  if [[ -n "$NEW_SCHEDULE_ID" ]]; then
    DEP2=$(node -e "const d=new Date();d.setDate(d.getDate()+2);d.setUTCHours(9,0,0,0);console.log(d.toISOString())")
    ARR2=$(node -e "const d=new Date();d.setDate(d.getDate()+2);d.setUTCHours(14,0,0,0);console.log(d.toISOString())")
    run PATCH "/admin/schedules/$NEW_SCHEDULE_ID/reschedule" -H 'Content-Type: application/json' \
      -d "{\"departureAt\":\"$DEP2\",\"estimatedArrivalAt\":\"$ARR2\",\"reason\":\"Mock reschedule test\"}"
    assert_status "PATCH /admin/schedules/:id/reschedule" 200

    run PATCH "/admin/schedules/$NEW_SCHEDULE_ID/cancel"
    assert_status "PATCH /admin/schedules/:id/cancel" 200
  fi
elif [[ -n "$SCHEDULE_ID" ]]; then
  run PATCH "/admin/schedules/$SCHEDULE_ID/cancel"
  assert_status "PATCH /admin/schedules/:id/cancel (existing)" 200
fi

log "Admin — reports (ADMIN only)"
run GET /admin/reports/sales
assert_status "GET /admin/reports/sales" 200

run GET /admin/reports/analytics/overview
assert_status "GET /admin/reports/analytics/overview" 200

run GET /admin/reports/export/csv
assert_status "GET /admin/reports/export/csv" 200

log "Forbidden — counter cannot access reports"
COUNTER_TOKEN=$(curl -sS -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d '{"phone":"01700000002","password":"password123"}' | node -e "
    const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
    console.log(d.data?.token||'');
  ")
LAST_CODE=$(curl -sS -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $COUNTER_TOKEN" \
  "$API/admin/reports/sales")
if [[ "$LAST_CODE" == "403" ]]; then
  printf '  ✓ %-55s %s\n' "GET /admin/reports/sales as COUNTER → 403" "$LAST_CODE"
  PASS=$((PASS + 1))
else
  printf '  ✗ %-55s expected 403 got %s\n' "GET /admin/reports/sales as COUNTER" "$LAST_CODE"
  FAIL=$((FAIL + 1))
fi

printf '\n════════════════════════════════════════\n'
printf '  ADMIN API: PASS %s   FAIL %s\n' "$PASS" "$FAIL"
printf '════════════════════════════════════════\n'

[[ "$FAIL" -eq 0 ]]
