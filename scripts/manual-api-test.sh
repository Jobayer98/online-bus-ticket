#!/usr/bin/env bash
# Manual API smoke test — hits every /api/v1 route in dependency order.
# Usage: ./scripts/manual-api-test.sh [BASE_URL]
# Requires: curl, jq (optional but recommended)

set -euo pipefail

BASE="${1:-http://localhost:4000}"
API="$BASE/api/v1"
PASS=0
FAIL=0
SKIP=0
COOKIE_JAR="$(mktemp)"
ADMIN_JAR="$(mktemp)"
COUNTER_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR" "$ADMIN_JAR" "$COUNTER_JAR"' EXIT

# Tomorrow (local) — matches seed schedule date
TRIP_DATE="$(node -e "const d=new Date();d.setDate(d.getDate()+1);console.log(d.toISOString().slice(0,10))")"

has_jq() { command -v jq >/dev/null 2>&1; }

log() { printf '\n━━━ %s ━━━\n' "$1"; }

# run METHOD PATH [curl args...]
# Sets LAST_CODE, LAST_BODY
run() {
  local method="$1" path="$2"
  shift 2
  local url="$API$path"
  local out
  out="$(mktemp)"
  LAST_CODE=$(curl -sS -o "$out" -w '%{http_code}' -X "$method" "$url" "$@")
  LAST_BODY="$(cat "$out")"
  rm -f "$out"
}

assert_status() {
  local name="$1" expected="$2"
  if [[ "$LAST_CODE" == "$expected" ]]; then
    printf '  ✓ %-50s %s\n' "$name" "$LAST_CODE"
    PASS=$((PASS + 1))
    return 0
  fi
  printf '  ✗ %-50s expected %s got %s\n' "$name" "$expected" "$LAST_CODE"
  if has_jq && echo "$LAST_BODY" | jq -e . >/dev/null 2>&1; then
    echo "$LAST_BODY" | jq -c '.' 2>/dev/null | head -c 500
    echo
  else
    echo "    $LAST_BODY" | head -c 300
    echo
  fi
  FAIL=$((FAIL + 1))
  return 1
}

assert_status_one_of() {
  local name="$1"
  shift
  for e in "$@"; do
    if [[ "$LAST_CODE" == "$e" ]]; then
      printf '  ✓ %-50s %s\n' "$name" "$LAST_CODE"
      PASS=$((PASS + 1))
      return 0
    fi
  done
  printf '  ✗ %-50s expected one of [%s] got %s\n' "$name" "$*" "$LAST_CODE"
  echo "    $LAST_BODY" | head -c 300
  echo
  FAIL=$((FAIL + 1))
  return 1
}

skip() {
  printf '  ⊘ %-50s %s\n' "$1" "$2"
  SKIP=$((SKIP + 1))
}

# Extract JSON field: jq expression or dot path (e.g. .data[0].id)
json_val() {
  local expr="$1"
  if has_jq; then
    echo "$LAST_BODY" | jq -r "$expr" 2>/dev/null | head -1
    return
  fi
  printf '%s' "$LAST_BODY" | node -e "
    const data = JSON.parse(require('fs').readFileSync(0, 'utf8'));
    const expr = process.argv[1];
    const pick = (obj, path) => {
      const keys = path.replace(/^\./, '').match(/[^.\\[\\]]+|\\[\\d+\\]/g) || [];
      return keys.reduce((o, k) => {
        if (o == null) return undefined;
        if (k.startsWith('[')) return o[Number(k.slice(1, -1))];
        return o[k];
      }, obj);
    };
    if (expr.includes('select(')) {
      const m = expr.match(/\\.data\\.seats\\[\\] \\| select\\(\\.status==\"([^\"]+)\"\\) \\| \\.label/);
      if (m) {
        const found = (data?.data?.seats ?? []).find((s) => s.status === m[1]);
        if (found) { console.log(found.label); process.exit(0); }
      }
      const m2 = expr.match(/\\.data\\.bookingId \\/\\/ \\.data\\.id/);
      if (m2) { console.log(data?.data?.bookingId ?? data?.data?.id ?? ''); process.exit(0); }
      const m3 = expr.match(/\\.data\\.ticket\\.passengerNumber/);
      if (m3) { console.log(data?.data?.ticket?.passengerNumber ?? ''); process.exit(0); }
    }
    const path = expr.startsWith('.') ? expr : '.' + expr;
    const v = pick(data, path);
    if (v != null && typeof v !== 'object') console.log(String(v));
  " "$expr" 2>/dev/null | head -1
}

log "Health & docs"
run GET /health
assert_status "GET /health" 200

run GET /health  # swagger is outside v1
LAST_CODE=$(curl -sS -o /dev/null -w '%{http_code}' "$BASE/api-docs/openapi.json")
assert_status_one_of "GET /api-docs/openapi.json" 200 301

log "Auth"
run POST /auth/login -H 'Content-Type: application/json' \
  -d '{"phone":"01700000001","password":"password123"}' \
  -c "$ADMIN_JAR"
assert_status "POST /auth/login (admin)" 200
ADMIN_TOKEN=""
if has_jq; then ADMIN_TOKEN=$(json_val '.data.token'); fi

run POST /auth/login -H 'Content-Type: application/json' \
  -d '{"phone":"01700000002","password":"password123"}' \
  -c "$COUNTER_JAR"
assert_status "POST /auth/login (counter)" 200

run POST /auth/register -H 'Content-Type: application/json' \
  -d "{\"phone\":\"017$(date +%s | tail -c 8)\",\"password\":\"password123\",\"name\":\"Test User\"}" \
  -c "$COOKIE_JAR" || true
assert_status_one_of "POST /auth/register (new user)" 200 409

run POST /auth/logout -b "$COOKIE_JAR" -c "$COOKIE_JAR"
assert_status "POST /auth/logout" 200

log "Schedule (public)"
run GET /schedules/stops
assert_status "GET /schedules/stops" 200
FROM_STOP=$(json_val '.data[0].id')
TO_STOP=$(json_val '.data[1].id')

if [[ -z "$FROM_STOP" || "$FROM_STOP" == "null" ]]; then
  skip "schedule search chain" "no stops in DB — run pnpm db:seed"
  SCHEDULE_ID=""
  ROUTE_SLUG="dhaka-pabna"
  BOARDING_ID=""
else
  run GET "/schedules/search?fromStopId=$FROM_STOP&toStopId=$TO_STOP&date=$TRIP_DATE"
  assert_status "GET /schedules/search" 200
  SCHEDULE_ID=$(json_val '.data[0].scheduleId')
  ROUTE_SLUG=$(json_val '.data[0].routeSlug')
  [[ -z "$ROUTE_SLUG" || "$ROUTE_SLUG" == "null" ]] && ROUTE_SLUG="dhaka-pabna"

  run GET "/schedules/by-route/$ROUTE_SLUG"
  assert_status "GET /schedules/by-route/:slug" 200
  BOARDING_ID=""

  if [[ -n "$SCHEDULE_ID" && "$SCHEDULE_ID" != "null" ]]; then
    run GET "/schedules/$SCHEDULE_ID/seat-map"
    assert_status "GET /schedules/:id/seat-map" 200
    SEAT_LABEL=$(json_val '.data.seats[] | select(.status=="AVAILABLE") | .label')
    BOARDING_ID=$(json_val '.data.boardingPoints[0].id')
  else
    SEAT_LABEL=""
    skip "GET /schedules/:id/seat-map" "no schedules for trip date"
  fi
fi

log "Users (admin)"
run GET /users/me -b "$ADMIN_JAR"
assert_status "GET /users/me" 200

run GET "/users/me/bookings?page=1&pageSize=5" -b "$ADMIN_JAR"
assert_status "GET /users/me/bookings" 200

log "Admin — stops"
run GET /admin/stops -b "$ADMIN_JAR"
assert_status "GET /admin/stops" 200

run POST /admin/stops -b "$ADMIN_JAR" -H 'Content-Type: application/json' \
  -d "{\"name\":\"Test Stop\",\"city\":\"TestCity\",\"code\":\"TST$(date +%s | tail -c 4)\"}"
assert_status_one_of "POST /admin/stops" 201 409

STOP_ID=$(json_val '.data.id')
if [[ -n "$STOP_ID" && "$STOP_ID" != "null" ]]; then
  run PATCH "/admin/stops/$STOP_ID" -b "$ADMIN_JAR" -H 'Content-Type: application/json' \
    -d '{"name":"Test Stop Updated"}'
  assert_status "PATCH /admin/stops/:id" 200
fi

log "Admin — routes, coaches, layouts, schedules"
run GET /admin/routes -b "$ADMIN_JAR"
assert_status "GET /admin/routes" 200

run GET /admin/coaches -b "$ADMIN_JAR"
assert_status "GET /admin/coaches" 200
COACH_ID=$(json_val '.data[0].id')
LAYOUT_ID=$(json_val '.data[0].seatLayout.id')

run GET /admin/layouts -b "$ADMIN_JAR"
assert_status "GET /admin/layouts" 200

run GET /admin/schedules -b "$ADMIN_JAR"
assert_status "GET /admin/schedules" 200

log "Admin — reports"
run GET /admin/reports/sales -b "$ADMIN_JAR"
assert_status "GET /admin/reports/sales" 200

run GET /admin/reports/analytics/overview -b "$ADMIN_JAR"
assert_status "GET /admin/reports/analytics/overview" 200

run GET /admin/reports/export/csv -b "$ADMIN_JAR"
assert_status "GET /admin/reports/export/csv" 200

log "Booking → payment → ticket flow"
HOLD_ID=""
BOOKING_ID=""
PASSENGER_NUM=""

if [[ -n "${SCHEDULE_ID:-}" && "$SCHEDULE_ID" != "null" && -n "${SEAT_LABEL:-}" ]]; then
  run POST /bookings/hold -H 'Content-Type: application/json' \
    -d "{\"scheduleId\":\"$SCHEDULE_ID\",\"seatLabels\":[\"$SEAT_LABEL\"],\"sessionId\":\"manual-test-$(date +%s)\"}"
  assert_status "POST /bookings/hold" 201
  HOLD_ID=$(json_val '.data.holdId')

  if [[ -n "$HOLD_ID" && "$HOLD_ID" != "null" && -n "$BOARDING_ID" ]]; then
    run POST /bookings -H 'Content-Type: application/json' \
      -d "{\"holdId\":\"$HOLD_ID\",\"boardingPointId\":\"$BOARDING_ID\",\"passenger\":{\"name\":\"Manual Tester\",\"phone\":\"01799999999\"}}"
    assert_status "POST /bookings" 201
    BOOKING_ID=$(json_val '.data.id')
    PASSENGER_NUM=$(json_val '.data.ticket.passengerNumber')

    if [[ -n "$BOOKING_ID" && "$BOOKING_ID" != "null" ]]; then
      run GET "/bookings/$BOOKING_ID"
      assert_status "GET /bookings/:id" 200

      run POST /payments/initiate -H 'Content-Type: application/json' \
        -d "{\"bookingId\":\"$BOOKING_ID\",\"method\":\"ONLINE\"}"
      assert_status "POST /payments/initiate" 200
      CLIENT_SECRET=$(json_val '.data.clientSecret')

      run POST /payments/confirm -H 'Content-Type: application/json' \
        -H "Idempotency-Key: manual-$BOOKING_ID" \
        -d "{\"bookingId\":\"$BOOKING_ID\",\"clientSecret\":\"$CLIENT_SECRET\"}"
      assert_status "POST /payments/confirm" 200

      if [[ -n "$PASSENGER_NUM" && "$PASSENGER_NUM" != "null" ]]; then
        run GET "/tickets/lookup?passengerNumber=$PASSENGER_NUM&phone=01799999999"
        assert_status "GET /tickets/lookup" 200

        run GET "/tickets/download?passengerNumber=$PASSENGER_NUM&phone=01799999999"
        assert_status "GET /tickets/download" 200
      fi
    fi
  else
    skip "booking/payment/ticket" "missing hold or boarding point"
  fi
else
  skip "booking/payment/ticket" "no schedule/seat from search"
fi

run POST /payments/webhook -H 'Content-Type: application/json' -d '{}'
assert_status "POST /payments/webhook" 200

log "Counter"
if [[ -n "${SCHEDULE_ID:-}" && "$SCHEDULE_ID" != "null" ]]; then
  run GET "/schedules/$SCHEDULE_ID/seat-map"
  SEAT2=$(json_val '.data.seats[] | select(.status=="AVAILABLE") | .label')
  [[ -z "$SEAT2" ]] && SEAT2="${SEAT_LABEL:-1A}"
  if [[ -n "$BOARDING_ID" ]]; then
    run POST /counter/sell -b "$COUNTER_JAR" -H 'Content-Type: application/json' \
      -d "{\"scheduleId\":\"$SCHEDULE_ID\",\"seatLabels\":[\"$SEAT2\"],\"boardingPointId\":\"$BOARDING_ID\",\"passenger\":{\"name\":\"Counter Pax\",\"phone\":\"01788888888\"},\"method\":\"CASH\"}"
    assert_status_one_of "POST /counter/sell" 201 409
    COUNTER_BOOKING=$(json_val '.data.bookingId // .data.id')
    if [[ -n "$COUNTER_BOOKING" && "$COUNTER_BOOKING" != "null" ]]; then
      run POST /counter/change -b "$COUNTER_JAR" -H 'Content-Type: application/json' \
        -d "{\"bookingId\":\"$COUNTER_BOOKING\",\"note\":\"seat change request\"}"
      assert_status "POST /counter/change" 200
    fi
  fi
fi

run GET /counter/transactions/today -b "$COUNTER_JAR"
assert_status "GET /counter/transactions/today" 200

log "Validation errors (expect 400)"
run POST /auth/login -H 'Content-Type: application/json' -d '{"phone":"x"}'
assert_status "POST /auth/login invalid body" 400

run GET /users/me
assert_status "GET /users/me without auth" 401

printf '\n════════════════════════════════════════\n'
printf '  PASS: %s   FAIL: %s   SKIP: %s\n' "$PASS" "$FAIL" "$SKIP"
printf '════════════════════════════════════════\n'

[[ "$FAIL" -eq 0 ]]
