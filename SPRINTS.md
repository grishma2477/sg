# SG Ride-Sharing — Complete Production Sprint Plan (Refined)
_Last updated: 2026-06-24_

## Goal
After all 12 sprints: a fully production-ready, App Store + Play Store submitted ride-sharing platform
technically capable of competing with Pathao and InDrive.

## Deliverables per sprint
After every sprint:
- Updated `backend/api-tests.rest` (cumulative — all endpoints ever built)
- `backend/postman/sprint-N-complete.json` (Postman collection with auto-token scripts + assertions)

## Stack
| Layer | Technology |
|-------|-----------|
| Backend | Node.js 20 LTS, Express 5, PostgreSQL 16 + PostGIS 3 |
| Realtime | Socket.io 4 |
| Queue/Cache | Bull 4 + Redis 7 |
| File Storage | Cloudinary |
| Maps | Google Maps Platform (Places, Directions, Distance Matrix, Geocoding) |
| SMS OTP | Sparrow SMS (Nepal primary) + Twilio (fallback) |
| Payments | eSewa, Khalti (Nepal), extensible for others |
| Push Notifications | Firebase Cloud Messaging (FCM) via firebase-admin |
| Web Frontend | React 19 + Vite + Tailwind CSS |
| Mobile | React Native + Expo SDK 52 + Expo Router |
| Reverse Proxy | Nginx |
| Process Manager | PM2 (cluster mode) |
| Monitoring | Winston (logs) + Sentry (errors) |
| CI/CD | GitHub Actions |
| Containers | Docker + Docker Compose |

---

# SPRINT 0 — Critical Security Fixes + All Broken Endpoints
**Scope: Fix everything broken before building anything new**
**Estimated days: 3–4**
**Blocked by: Nothing — start here**

## 0.1 — Security Fixes (do in this exact order)

**0.1.1 — auth.js — JWT try-catch**
- File: `backend/src/middleware/auth.js`
- Wrap `jwt.verify()` in try-catch
- Catch returns `res.status(401).json({ success: false, message: "Unauthorized" })`
- Never reaches Express default error handler

**0.1.2 — authController.js — Remove JWT secret fallback**
- File: `backend/src/controllers/authController.js`
- Remove `|| 'your-secret-key'` from both sign calls
- If env var is missing: `throw new Error("ACCESS_TOKEN_SECRET_KEY not set")`

**0.1.3 — authController.js — Remove hardcoded KYC data on register**
- Registration should NOT create a KYC row
- Remove the KYC insert from the register transaction
- KYC row is created only when user submits `POST /api/kyc/complete`

**0.1.4 — adminPaymentProviderRoutes.js — Add auth middleware**
- File: `backend/src/routes/adminPaymentProviderRoutes.js`
- Add `import { verifyuser } from "../middleware/auth.js"`
- Add `router.use(verifyuser)` as first line BEFORE `router.use(requireRole("admin"))`

**0.1.5 — Env validation on startup**
- File: `backend/src/server.js`
- Add required env vars check at top:
  ```
  ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY,
  ACCESS_TOKEN_EXPIRATION_TIME, REFRESH_TOKEN_EXPIRATION_TIME,
  DATABASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  ```
- If any missing: log which ones and `process.exit(1)`

## 0.2 — Fix Missing Imports (ReferenceError crashes)

**0.2.1 — driverLocationController.js**
- Add `import { pool } from "../database/DBConnection.js"` at top

**0.2.2 — PaymentProviderService.js**
- Add `import { pool } from "../../database/DBConnection.js"` at top

## 0.3 — Fix Missing Constants

**0.3.1 — Constant.js**
- Add to `String` object: `REQUEST_EXPIRY_MINUTES: 5`
- Add to `String` object: `PLATFORM_FEE_PERCENTAGE: 20`
- Remove all hardcoded `0.20` and `20%` platform fee values in bidding/ride controllers; use this constant

## 0.4 — Fix Broken Service Methods

**0.4.1 — PaymentService.js — implement getPaymentDetails**
- Method signature: `static async getPaymentDetails(paymentId, userId)`
- Query `ride_payments` by id with `WHERE (rider_id = $2 OR driver_id = $2)` for ownership
- Return full payment record with ride details joined

**0.4.2 — PaymentMethodService.js — implement getUserPaymentMethods**
- Method signature: `static async getUserPaymentMethods(userId)`
- Query `payment_methods WHERE user_id = $1 AND deleted_at IS NULL ORDER BY is_default DESC`

**0.4.3 — PaymentMethodService.js — implement deletePaymentMethod**
- Method signature: `static async deletePaymentMethod(methodId, userId)`
- Soft delete: `UPDATE payment_methods SET deleted_at = NOW() WHERE id = $1 AND user_id = $2`
- If it was the default, promote the next method to default

## 0.5 — Fix Controller Bugs

**0.5.1 — rideRequestController.js — updateDriverLocation**
- Query `SELECT id FROM drivers WHERE user_id = $1` using `req.user.id`
- Use the returned `driverId` for the location update, not `req.user.driverId`

**0.5.2 — driverApplicationController.js — driverId scoping**
- File: `backend/src/controllers/driverApplicationController.js` in `reviewApplication`
- Change `const driverId` inside the if block to `let driverId` at function top
- Assign in both if and else branches

**0.5.3 — adminRideController.js — catch block**
- Change `return(err)` to `next(err)` in the createRide catch block

**0.5.4 — paymentRoutes.js — duplicate route**
- Remove duplicate `router.get('/:paymentId', ...)` (keep only one)

## 0.6 — Mount Dead Routes

**0.6.1 — app.js — mount 4 unmounted route files**
- Fix `safetyCommentRoutes.js` import first: change `requireRole` import to `../middleware/requireRole.js`
- Add to `app.js`:
  ```js
  import driverProfileRoutes from "./routes/driverProfileRoutes.js"
  import driverVerificationRoutes from "./routes/driverRoutes.js"
  import adminBadgeRoutes from "./routes/adminBadgeRoutes.js"
  import safetyCommentRoutes from "./routes/safetyCommentRoutes.js"

  app.use('/api/drivers', driverProfileRoutes)
  app.use('/api/drivers', driverVerificationRoutes)
  app.use('/api/admin', adminBadgeRoutes)
  app.use('/api/safety', safetyCommentRoutes)
  ```

## 0.7 — Sprint 0 Deliverables
- [ ] All 6 security fixes applied
- [ ] All 3 ReferenceErrors resolved
- [ ] All 3 missing service methods implemented
- [ ] All controller bugs fixed
- [ ] All 4 route files mounted
- [ ] Updated `backend/api-tests.rest`
- [ ] `backend/postman/sprint-0-complete.json`

**Definition of Done:** Server starts clean, no ReferenceErrors on any endpoint, all 104 endpoints return meaningful responses (not 500 from missing methods).

---

# SPRINT 1 — Google Maps + Location Infrastructure
**Scope: Replace fake Haversine distance with real road-based maps**
**Estimated days: 3–4**
**Blocked by: Sprint 0**

This is the most important infrastructure sprint. Every fare estimate and ETA in the app is wrong without real map data. Pathao and InDrive both use Google Maps.

## 1.1 — Google Maps Platform Setup

**1.1.1 — API keys required**
- Enable in Google Cloud Console:
  - Maps JavaScript API (for web dashboard)
  - Maps SDK for Android (for mobile)
  - Maps SDK for iOS (for mobile)
  - Places API
  - Directions API
  - Distance Matrix API
  - Geocoding API
- Create two API keys: one for backend (server key, no HTTP referrer restriction), one for frontend (web + mobile, restricted)
- Add to `.env`: `GOOGLE_MAPS_API_KEY_SERVER`, `GOOGLE_MAPS_API_KEY_CLIENT`

**1.1.2 — Backend map client**
- Install: `npm install @googlemaps/google-maps-services-js`
- Create: `backend/src/infrastructure/mapsClient.js`
  - Export: `getDirections(origin, destination, waypoints)` → returns route, distance_meters, duration_seconds, polyline
  - Export: `getDistanceMatrix(origins, destinations)` → returns distance + ETA for driver-to-pickup
  - Export: `geocodeAddress(address)` → returns lat/lng for text address
  - Export: `reverseGeocode(lat, lng)` → returns formatted address

## 1.2 — Real Fare Calculation

**1.2.1 — PricingCalculationService.js — rewrite**
- Remove Haversine distance
- Call `mapsClient.getDirections(pickup, dropoff, stops)` to get `distance_meters` and `duration_seconds`
- Fare formula:
  ```
  base_fare = VEHICLE_BASE_FARE[vehicle_type]       // e.g. Bike: 30, Car: 50, SUV: 70
  distance_fare = (distance_km * RATE_PER_KM[vehicle_type])
  time_fare = (duration_min * RATE_PER_MIN[vehicle_type])
  subtotal = base_fare + distance_fare + time_fare
  surge_fare = subtotal * surge_multiplier           // default 1.0
  min_fare = MIN_FARE[vehicle_type]
  final_fare = MAX(surge_fare, min_fare)
  ```
- All rates stored in `Constant.js` — never hardcoded in service

**1.2.2 — Fare estimation endpoint**
- Route: `GET /api/ride-requests/estimate`
- Query params: `pickup_lat`, `pickup_lng`, `dropoff_lat`, `dropoff_lng`, `vehicle_type`, `stops` (JSON array)
- Response:
  ```json
  {
    "distance_km": 5.2,
    "duration_minutes": 18,
    "polyline": "encoded_polyline_string",
    "estimates": [
      { "vehicle_type": "bike", "fare_min": 80, "fare_max": 100, "eta_driver_minutes": 3 },
      { "vehicle_type": "car",  "fare_min": 150, "fare_max": 180, "eta_driver_minutes": 5 },
      { "vehicle_type": "suv",  "fare_min": 200, "fare_max": 240, "eta_driver_minutes": 8 }
    ]
  }
  ```
- Returns all vehicle types so the rider can see all options at once (like Pathao)

**1.2.3 — Update createRideRequest to use real fare**
- Before inserting, call `PricingCalculationService.estimate(pickup, dropoff, stops, vehicle_type)`
- Store `estimated_fare_min`, `estimated_fare_max`, `distance_km`, `duration_minutes`, `route_polyline` on the request

**1.2.4 — Driver matching uses road distance for ETA**
- `DriverMatchingService.js` — replace Haversine driver-to-pickup with Distance Matrix API call
- ETA shown to rider = Google Maps ETA from driver current location to pickup

## 1.3 — Address Autocomplete API

**1.3.1 — Places autocomplete proxy**
- Route: `GET /api/maps/autocomplete?query=&lat=&lng=`
- Calls Google Places Autocomplete API with Nepal bias
- Returns `[{ place_id, description, main_text, secondary_text }]`
- Proxied through backend to hide API key from client

**1.3.2 — Place details**
- Route: `GET /api/maps/place/:placeId`
- Returns `{ lat, lng, formatted_address, name }`

**1.3.3 — Reverse geocode (for current location)**
- Route: `GET /api/maps/reverse?lat=&lng=`
- Returns formatted address for "Use my current location" button

## 1.4 — Route Polyline Storage

**1.4.1 — Store route on ride creation**
- When a ride is accepted (bid accepted or direct accept), call Directions API with actual pickup + stops + dropoff
- Store encoded polyline in `rides.route_polyline`
- Mobile app decodes and draws on map

## 1.5 — Sprint 1 Deliverables
- [ ] Google Maps client wrapper (`mapsClient.js`)
- [ ] `GET /api/ride-requests/estimate` returns real road-based fares for all vehicle types
- [ ] `GET /api/maps/autocomplete` works for address search
- [ ] `GET /api/maps/place/:placeId` works
- [ ] `GET /api/maps/reverse` works
- [ ] createRideRequest stores real distance, duration, route_polyline
- [ ] Driver ETA uses Distance Matrix, not Haversine
- [ ] Updated `.rest` + Postman JSON

**Definition of Done:** Call `/api/ride-requests/estimate` with Thamel → Patan coords. Response has real road distance (~9km not 5km straight line) and realistic NPR fare.

---

# SPRINT 2 — Phone Auth + SMS OTP + Auth Hardening
**Scope: Replace email/password with phone-first auth. Add refresh tokens, rate limiting, input validation.**
**Estimated days: 4–5**
**Blocked by: Sprint 0**

Phone number login is standard for all ride apps in Nepal. No one uses email to book a ride.

## 2.1 — SMS OTP Provider Setup

**2.1.1 — Sparrow SMS (primary — Nepal)**
- Account at sparrowsms.com
- Add to `.env`: `SPARROW_SMS_TOKEN`, `SPARROW_SMS_FROM`
- Install: `npm install axios` (already there)
- Create: `backend/src/infrastructure/smsClient.js`
  - `sendOTP(phone, otp)` — sends via Sparrow SMS API
  - `generateOTP()` — returns 6-digit string
  - OTP stored in Redis: `otp:{phone}` with 5-minute TTL
  - Max 3 attempts per phone per 15 minutes

**2.1.2 — Twilio (fallback — international numbers)**
- Install: `npm install twilio`
- Add to `.env`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- `smsClient.js` — if Sparrow fails, fall back to Twilio

## 2.2 — Phone-First Auth Flow

**2.2.1 — New auth endpoints**
Replace current email+password flow with:

```
POST /api/auth/send-otp
  Body: { phone: "9800000001" }
  Sends OTP to phone, returns { message: "OTP sent", expires_in: 300 }

POST /api/auth/verify-otp
  Body: { phone: "9800000001", otp: "123456", full_name: "..." (only on first time) }
  If phone exists: login → returns { access_token, refresh_token, user }
  If phone new: register + login → returns same
  This is the Pathao/InDrive flow: one endpoint handles both register and login

POST /api/auth/resend-otp
  Body: { phone: "9800000001" }
  Rate limited: 3 resends per 15 minutes

POST /api/auth/refresh
  Body: { refresh_token: "..." }
  Returns new access_token + rotated refresh_token

POST /api/auth/logout
  Header: Authorization
  Body: { refresh_token: "..." }
  Revokes the refresh token for this device

POST /api/auth/logout-all
  Header: Authorization
  Revokes all refresh tokens for the user (all devices)
```

Keep `POST /api/auth/register` and `POST /api/auth/login` (email+password) for the admin web dashboard login only.

**2.2.2 — Refresh token database table**
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,  -- SHA-256 of token
  device_id VARCHAR(255),           -- optional: "iPhone 15", "Samsung S25"
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON refresh_tokens(token_hash);
CREATE INDEX ON refresh_tokens(user_id);
```

**2.2.3 — Refresh token flow**
- Access token TTL: 15 minutes
- Refresh token TTL: 30 days
- On refresh: verify hash in DB, check not revoked, check not expired, issue new access token + rotate refresh token (delete old, insert new)
- Stolen token protection: if a revoked token is used, revoke ALL tokens for that user

**2.2.4 — FCM token registration**
- `PUT /api/auth/device` — stores FCM token + device info for push notifications
  ```json
  { "fcm_token": "...", "device_type": "android", "device_id": "..." }
  ```

## 2.3 — Rate Limiting

**2.3.1 — Install and configure**
- Install: `npm install express-rate-limit rate-limit-redis`
- Redis-backed store (so limits survive server restart)

**2.3.2 — Apply limits**
```
POST /api/auth/send-otp       → 5 requests per 15 min per IP
POST /api/auth/verify-otp     → 10 attempts per 15 min per IP
POST /api/auth/login          → 10 attempts per 15 min per IP (admin login)
POST /api/ride-requests       → 20 per hour per user
POST /api/bidding/.../submit  → 30 per hour per driver
POST /api/wallet/topup        → 10 per hour per user
Global API                    → 300 requests per minute per IP
```

## 2.4 — Input Validation

**2.4.1 — Install and configure**
- Install: `npm install zod`
- Create: `backend/src/middleware/validate.js` — takes a Zod schema, validates `req.body`, returns 400 with field errors on failure

**2.4.2 — Schemas to implement**
```
authSchemas.sendOtp       → phone (Nepali: /^9[78]\d{8}$/)
authSchemas.verifyOtp     → phone, otp (6 digits), full_name (optional)
authSchemas.login         → email, password
rideSchemas.estimate      → pickup/dropoff lat/lng (valid ranges for Nepal), vehicle_type enum
rideSchemas.create        → same as estimate + optional stops array (max 5)
bidSchemas.submit         → bid_amount (positive, max 10000), message (max 200 chars)
walletSchemas.topup       → amount (min 50, max 50000 NPR)
walletSchemas.withdraw    → amount (positive, max available balance)
walletSchemas.transfer    → to_user_id (integer), amount (positive)
paymentMethodSchemas.add  → type (enum), account_identifier (non-empty)
```

**2.4.3 — Apply to all write endpoints**
- Every `POST`, `PUT`, `PATCH`, `DELETE` that takes a body gets a schema validator

## 2.5 — Security Headers

**2.5.1 — Helmet**
- Install: `npm install helmet`
- `app.use(helmet())` in `app.js` before all routes
- Override CORS origin: allow only `process.env.ALLOWED_ORIGINS` (comma-separated list)

## 2.6 — Sprint 2 Deliverables
- [ ] `POST /api/auth/send-otp` sends real SMS via Sparrow
- [ ] `POST /api/auth/verify-otp` handles both register and login
- [ ] `POST /api/auth/refresh` rotates refresh token
- [ ] `POST /api/auth/logout` and `logout-all` work
- [ ] `PUT /api/auth/device` stores FCM token
- [ ] Rate limits active on all auth + write endpoints
- [ ] Zod validation on all write endpoints (proper 400 field errors)
- [ ] Helmet security headers applied
- [ ] Updated `.rest` + Postman JSON

**Definition of Done:** Register new phone → receive real SMS → verify → get tokens → 15min later access token expires → refresh gives new one → logout revokes it → logout-all kills all devices.

---

# SPRINT 3 — Complete Wallet + Real Payment Gateways
**Scope: eSewa and Khalti live integration. Promo codes applied to rides. Ledger complete.**
**Estimated days: 4–5**
**Blocked by: Sprint 0**

## 3.1 — eSewa Integration

**3.1.1 — eSewa setup**
- Merchant account at esewa.com.np (or use eSewa test credentials for sandbox)
- Add to `.env`: `ESEWA_MERCHANT_ID`, `ESEWA_SECRET_KEY`, `ESEWA_BASE_URL`
- Create: `backend/src/infrastructure/payment-providers/esewaClient.js`

**3.1.2 — eSewa top-up flow**
```
Step 1: POST /api/wallet/topup/initiate
  Body: { amount: 500, provider: "esewa" }
  Backend creates a pending transaction, returns eSewa payment URL with params
  
Step 2: Rider completes payment on eSewa
  
Step 3: eSewa calls POST /api/payments/webhook/esewa
  Backend verifies HMAC signature (SHA-256 of "total_amount,transaction_uuid,product_code" with secret)
  On success: credit wallet, update transaction status, emit socket event + push notification
```

**3.1.3 — eSewa webhook verification**
- HMAC-SHA256 verification before any DB operation
- Idempotency: check if `transaction_uuid` already processed
- If duplicate: return 200 (eSewa may retry) but don't credit twice

## 3.2 — Khalti Integration

**3.2.1 — Khalti setup**
- Account at khalti.com
- Add to `.env`: `KHALTI_PUBLIC_KEY`, `KHALTI_SECRET_KEY`, `KHALTI_BASE_URL`
- Create: `backend/src/infrastructure/payment-providers/khaltiClient.js`

**3.2.2 — Khalti top-up flow**
```
Step 1: POST /api/wallet/topup/initiate
  Body: { amount: 500, provider: "khalti" }
  Calls Khalti /initiate endpoint, returns pidx + payment_url
  
Step 2: Rider completes on Khalti

Step 3: POST /api/wallet/topup/verify
  Body: { pidx: "..." }
  Backend calls Khalti /lookup to verify payment status
  On success: credit wallet
```

**3.2.3 — Unified top-up endpoint**
```
POST /api/wallet/topup/initiate
  Body: { amount, provider: "esewa"|"khalti" }
  Returns provider-specific payment URL/params

POST /api/wallet/topup/verify
  Body: { provider, transaction_id or pidx }
  Verifies with provider, credits wallet on success

GET /api/wallet/topup/status/:transactionId
  Returns current status of a pending top-up
```

## 3.3 — Promo Code + Gift Card Applied to Rides

**3.3.1 — Apply promo at ride request creation**
- `POST /api/ride-requests` body accepts optional `promo_code`
- If provided: validate via `PromoCodeService.validatePromoCode(code, userId, fareAmount)`
- Store `promo_code`, `discount_amount` on ride_request
- Reserved (not redeemed) until ride completes

**3.3.2 — Apply gift card at payment**
- `POST /api/ride-requests` body accepts optional `gift_card_code`
- Validate and hold gift card balance
- Applied at ride completion

**3.3.3 — Payment settlement with discount**
- `RidePaymentService.completeRidePayment` — deduct discount from rider charge
- Platform gets fee on discounted amount
- PromoCodeService marks promo as redeemed after successful settlement

## 3.4 — Ledger Completeness

**3.4.1 — Admin ledger audit endpoints**
```
GET /api/admin/ledger/summary
  Returns: platform_balance, total_rider_credits, total_driver_earnings, total_holds

GET /api/admin/ledger/entries?account_id=&from=&to=&page=&limit=
  Paginated ledger entries for any account

GET /api/admin/ledger/accounts
  List all ledger accounts (platform, riders, drivers) with current balances

GET /api/admin/ledger/verify
  Runs double-entry check: sum of all debits must equal sum of all credits
  Returns { balanced: true/false, discrepancy: 0 }
```

**3.4.2 — Wallet statement**
```
GET /api/wallet/statement?from=2026-01-01&to=2026-12-31
  Returns all transactions in date range with running balance
  Used by driver for income records / rider for expense records
```

**3.4.3 — Financial reconciliation worker**
- Daily cron job: runs `GET /api/admin/ledger/verify` equivalent
- If discrepancy found: logs alert and notifies admin via email/SMS

## 3.5 — Sprint 3 Deliverables
- [ ] eSewa top-up works in sandbox (initiate → pay → webhook → wallet credited)
- [ ] Khalti top-up works in sandbox (initiate → pay → verify → wallet credited)
- [ ] Promo code + gift card applied and deducted at ride completion
- [ ] Admin ledger audit endpoints working
- [ ] Wallet statement endpoint working
- [ ] Updated `.rest` + Postman JSON

**Definition of Done:** Top-up NPR 500 via eSewa sandbox → wallet shows NPR 500 → book ride with WELCOME10 promo → ride completes → wallet charged discounted amount → driver earns → ledger balanced check passes.

---

# SPRINT 4 — Complete Ride Flow (Stops + Real-Time)
**Scope: Stops show everywhere. Real-time events for every state change. Live driver tracking.**
**Estimated days: 3–4**
**Blocked by: Sprint 1 (needs route polyline)**

## 4.1 — Fix Stops Everywhere

**4.1.1 — Stops included in all ride request responses**
These queries need `LEFT JOIN ride_request_stops rrs ON rrs.ride_request_id = rr.id` and aggregate into an array:
- `GET /api/ride-requests/nearby` — each request includes its stops
- `GET /api/ride-requests/:id` — includes stops
- `GET /api/ride-requests` — includes stops
- `GET /api/bidding/requests/:id/bids` — the request object inside each bid includes stops

Response stops array format:
```json
"stops": [
  {
    "id": 1,
    "name": "Ratna Park",
    "latitude": 27.7069,
    "longitude": 85.3134,
    "order": 1,
    "arrived_at": null,
    "departed_at": null
  }
]
```

**4.1.2 — Stops shown on ride details**
- `GET /api/rides/:rideId` — includes full stops array with timestamps
- `GET /api/admin/rides/:id` — includes stops

**4.1.3 — Stop sequence validation**
- `arriveAtStop` and `departFromStop` — validate that stops are done in order (can't skip stop 2 before stop 1)
- Return 400 if out of sequence

## 4.2 — Real-Time Events via Socket.io

**4.2.1 — Socket room architecture**
```
user:{userId}     → rider receives ride events
driver:{driverId} → driver receives ride requests, ride events
admin             → admin receives live metrics
```

**4.2.2 — Ride request lifecycle events**
```
new_ride_request        → emitted to nearby online drivers when rider creates request
bid_placed              → emitted to rider room when driver submits bid
bid_accepted            → emitted to driver room when rider accepts their bid
ride_request_cancelled  → emitted to all drivers who bid when rider cancels
ride_request_expired    → emitted to rider when request times out with no accept
```

**4.2.3 — Active ride events**
```
driver_assigned         → emitted to rider: driver accepted, heading to pickup
driver_en_route         → location updates (every 5s during active ride)
driver_arrived_pickup   → driver pressed "I've arrived"
ride_started            → driver pressed "Start ride"
stop_arrived            → driver arrived at intermediate stop
stop_departed           → driver departed intermediate stop
ride_completed          → ride done; includes payment summary
ride_cancelled          → ride cancelled; includes refund info
```

**4.2.4 — Implement in controllers**
- `rideController.acceptRideRequest` → emit `driver_assigned` to rider room
- `rideController.startRide` → emit `ride_started` to rider room
- `rideController.arriveAtStop` → emit `stop_arrived` to rider room
- `rideController.departFromStop` → emit `stop_departed` to rider room
- `rideController.completeRide` → emit `ride_completed` to both rooms
- `rideController.cancelRide` → emit `ride_cancelled` to both rooms
- `biddingController.submitBid` → emit `bid_placed` to rider room
- `biddingController.acceptBid` → emit `bid_accepted` to driver room

**4.2.5 — Nearby drivers broadcast on ride request creation**
```js
// In rideRequestController.createRideRequest after insert:
const nearbyDrivers = await DriverMatchingService.getNearbyOnlineDrivers(pickup_lat, pickup_lng, 5)
nearbyDrivers.forEach(driver => {
  io.to(`driver:${driver.id}`).emit('new_ride_request', rideRequestPayload)
})
```

## 4.3 — Live Driver Tracking During Ride

**4.3.1 — Location update during active ride**
- `POST /api/ride-requests/drivers/location` (already exists, fixed in Sprint 0)
- After saving location: check if driver has an active ride (`status = 'in_progress'`)
- If yes: emit `driver_en_route` to `user:{rider_id}` room with `{ lat, lng, heading, speed }`
- Cache last known position in Redis: `driver:location:{driverId}` (TTL: 30s)

**4.3.2 — Get live driver position**
- `GET /api/ride-requests/drivers/location/:driverId` — check Redis first, fall back to DB

## 4.4 — Ride Request Expiry Worker

**4.4.1 — Verify expiry worker**
- `workers/expireRideRequestsWorker.js` — ensure it runs every minute
- On expiry: update status → emit `ride_request_expired` to rider socket → send push notification
- Cancel any pending bids for expired requests

**4.4.2 — Add REQUEST_EXPIRY_MINUTES to worker**
- Use `String.REQUEST_EXPIRY_MINUTES` (set in Sprint 0)

## 4.5 — Sprint 4 Deliverables
- [ ] All ride request GET endpoints include stops array
- [ ] Bid listing includes stops from the request
- [ ] Stop arrive/depart validates sequence
- [ ] All 12 socket events emitted correctly
- [ ] Live driver location emits to rider during active ride
- [ ] Ride request broadcasts to nearby drivers on creation
- [ ] Expiry worker emits socket event + triggers push
- [ ] Updated `.rest` + Postman JSON

**Definition of Done:** Open two browser tabs (one as rider, one as driver), both connected via Socket.io. Rider creates request → driver tab gets `new_ride_request` event. Driver bids → rider tab gets `bid_placed`. Rider accepts → driver tab gets `bid_accepted`. Start ride → rider tab gets `ride_started`. Move between stops → events fire in order. Complete → both get `ride_completed`.

---

# SPRINT 5 — Driver System Completion
**Scope: Driver profile, safety scoring, badges, verified matching algorithm**
**Estimated days: 4–5**
**Blocked by: Sprint 0**

## 5.1 — Driver Profile & Onboarding Flow

**5.1.1 — Complete driver onboarding state machine**
A driver goes through these steps. The app should know which step they're on:
```
Step 1: Register (phone OTP)
Step 2: Complete KYC (documents)
Step 3: Submit driver application (license + vehicle)
Step 4: Wait for admin approval
Step 5: Create driver profile (auto-created on approval)
Step 6: Go online
```
- `GET /api/drivers/onboarding-status` — returns current step + what's needed next
- Used by mobile app to show the correct screen

**5.1.2 — Driver profile endpoints (already mounted in Sprint 0)**
- `GET /api/drivers/profile` — returns: name, photo, vehicle info, rating, safety points, safety level, badge status, total rides, member since
- `PUT /api/drivers/profile` — update vehicle info, photo

**5.1.3 — Driver stats endpoint**
- `GET /api/drivers/stats` — today's earnings, rides today, acceptance rate, online hours today

## 5.2 — Safety Score System Verification

**5.2.1 — Verify ReviewSubmissionService calculates correctly**
Spec from `Readme2.md`:
- Star rating impact: ⭐⭐⭐⭐⭐=+2, ⭐⭐⭐⭐=+1, ⭐⭐⭐=0, ⭐⭐=-5, ⭐=-10
- Positive taps: only TOP 2 highest-value count (cap at +6 per ride)
- Negative taps: ALL stack (cap at -40 per ride)
- Single-ride total floor: -50
- Safety concern: -40 + set visibility_multiplier to 0.3 + set review_required = true

**5.2.2 — Verify level thresholds**
```
≥ 950: Trusted (priority matching)
900–949: Very Good (normal)
850–899: Average (slightly reduced)
800–849: Low Trust (fewer rides)
< 800: Risk Flagged (excluded from matching)
```

**5.2.3 — Time-based recovery**
- Weekly cron: +1 safety point per 7 clean days (no incidents)
- `workers/safetyRecoveryWorker.js` — runs every Sunday

**5.2.4 — Test the Bull queue**
- Verify `safetyQueue` in Redis processes jobs
- Add dead letter queue handling (failed jobs logged and retried)

## 5.3 — Verified Safe Driver Badge

**5.3.1 — Badge criteria check (daily cron)**
- `workers/badgeAssignmentWorker.js` — runs daily at 2am
- Criteria (ALL required):
  - avg_rating ≥ 4.7
  - felt_safe_percentage ≥ 95% (rolling last 100 rides)
  - safety_concerns_last_60_days = 0
  - safety_points ≥ 950
- If criteria met AND no badge: assign badge, emit notification, log to audit
- If badge held AND criteria no longer met: remove badge, notify driver

**5.3.2 — Badge admin endpoints (already mounted Sprint 0)**
- `GET /api/admin/drivers/badges` — list all drivers with badge status
- `POST /api/admin/drivers/:driverId/badge` — manual grant `{ action: "grant"|"revoke", reason }`
- `GET /api/admin/drivers/:driverId/safety` — full safety history

## 5.4 — Driver Matching Algorithm Fix

**5.4.1 — Schema fix**
- `DriverMatchingService.js` — replace `estimated_fare_min/max` references with `estimated_fare_min` and `estimated_fare_max` (now correctly stored in Sprint 1)

**5.4.2 — Matching score formula (from Readme2.md)**
```
distanceScore = 1 - (distance_km / MAX_RADIUS_KM)   // closer = higher
pointScore = driver.safety_points / 1000              // capped at 1.2 for top drivers
safetyBonus = driver.has_badge ? 1.2 : 1.0

baseScore = (distanceScore * 0.4) + (pointScore * 0.4) + (safetyBonus * 0.2)
finalScore = baseScore * visibility_multiplier

// Filter: safety_points < 800 → excluded entirely
```

**5.4.3 — Sort nearby ride requests by score for driver**
- Drivers see ride requests sorted by how good a match they are (distance + surge + vehicle type match)

## 5.5 — Driver Earnings

**5.5.1 — Earnings endpoints**
```
GET /api/drivers/earnings/summary?period=today|week|month
  Returns: gross_earned, platform_fee_deducted, net_earned, total_rides, avg_per_ride

GET /api/drivers/earnings/history?page=&limit=
  Per-ride earnings: ride_id, date, distance, duration, gross, fee, net

GET /api/drivers/earnings/statement?from=&to=
  Full statement for accounting/tax purposes
```

## 5.6 — Sprint 5 Deliverables
- [ ] Driver onboarding status endpoint works (shows correct step)
- [ ] Safety score calculates correctly with all tap rules
- [ ] Badge assignment cron runs and assigns/removes correctly
- [ ] Admin badge management endpoints work
- [ ] Driver matching uses safety score + visibility multiplier
- [ ] Drivers below 800 points not shown in nearby results
- [ ] Driver earnings endpoints work
- [ ] Updated `.rest` + Postman JSON

**Definition of Done:** Submit 5-star ride review with "felt safe" + "respectful" taps → safety score increases by correct amount. Submit 1-star with safety concern → score drops 40+ points, visibility becomes 0.3, driver sees fewer requests.

---

# SPRINT 6 — Push Notifications + Notification Centre
**Scope: FCM push for every key event. In-app notification history.**
**Estimated days: 3–4**
**Blocked by: Sprint 2 (needs FCM token registration endpoint)**

## 6.1 — Firebase Setup

**6.1.1 — Firebase Admin SDK**
- Install: `npm install firebase-admin`
- Create Firebase project at console.firebase.google.com
- Download service account JSON
- Add to `.env`: `FIREBASE_SERVICE_ACCOUNT` (JSON string) or path to file
- Create: `backend/src/infrastructure/fcmClient.js`
  - `sendToUser(userId, { title, body, data })` — looks up FCM token for user, sends notification
  - `sendToMultiple(userIds, payload)` — batch send
  - `sendToTopic(topic, payload)` — for broadcasts (e.g., surge pricing in area)

## 6.2 — Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  type VARCHAR(50) NOT NULL,  -- 'ride', 'payment', 'kyc', 'driver', 'promo'
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON notifications(user_id, created_at DESC);
CREATE INDEX ON notifications(user_id, read_at) WHERE read_at IS NULL;
```

## 6.3 — NotificationService.js

```js
// backend/src/application/services/NotificationService.js
static async notify(userId, { title, body, data, type }) {
  // 1. Save to notifications table
  // 2. Send FCM push (don't await — fire and forget, log failures)
  // 3. Emit socket event 'notification' to user:{userId} room (for in-app real-time bell)
}
```

## 6.4 — Wire Notifications to All Events

| Event | Who Gets It | Title | Body |
|-------|------------|-------|------|
| Ride request created | Nearby drivers | "New Ride Request" | "NPR {fare} — {pickup} to {dropoff}" |
| Bid placed | Rider | "New Bid Received" | "{driver_name} bid NPR {amount}" |
| Bid accepted | Driver | "Bid Accepted!" | "Head to {pickup_location}" |
| Ride accepted (fixed) | Rider | "Driver Assigned" | "{driver_name} is on the way" |
| Driver arrived pickup | Rider | "Driver Arrived" | "Your driver is at the pickup point" |
| Ride started | Rider | "Ride Started" | "Enjoy your ride to {dropoff}" |
| Stop arrived | Rider | "Arrived at {stop_name}" | "Driver has arrived at your stop" |
| Ride completed | Rider | "Ride Completed" | "NPR {amount} charged. Rate your ride" |
| Ride completed | Driver | "Ride Completed" | "You earned NPR {net_amount}" |
| Ride cancelled (by driver) | Rider | "Ride Cancelled" | "Your driver cancelled. Looking for new driver..." |
| Ride cancelled (by rider) | Driver | "Ride Cancelled" | "Rider cancelled the ride" |
| KYC approved | User | "KYC Verified ✓" | "Your identity has been verified" |
| KYC rejected | User | "KYC Needs Attention" | "{reason}. Please resubmit" |
| Driver approved | Driver | "You're a Driver!" | "Start accepting rides now" |
| Payout approved | Driver | "Payout Approved" | "NPR {amount} will be transferred in 1-2 days" |
| Wallet top-up success | User | "Wallet Topped Up" | "NPR {amount} added to your wallet" |
| Low wallet balance | Rider | "Low Balance" | "Your wallet has NPR {amount}. Top up to book rides" |
| Safety concern filed | Driver | "Safety Review" | "A safety concern was filed. Our team will review" |
| Badge earned | Driver | "Badge Earned! 🏆" | "You are now a Verified Safe Driver" |

## 6.5 — Notification Centre Endpoints
```
GET /api/notifications?page=&limit=
  Returns paginated notifications, newest first

GET /api/notifications/unread-count
  Returns { count: 3 } — for badge on bell icon

PUT /api/notifications/:id/read
  Marks single notification as read

PUT /api/notifications/read-all
  Marks all as read
```

## 6.6 — Sprint 6 Deliverables
- [ ] Firebase Admin SDK wired up
- [ ] `NotificationService.notify()` saves to DB + sends FCM + emits socket
- [ ] All 18 notification events wired into correct controllers/services
- [ ] All 4 notification centre endpoints working
- [ ] Notification bell unread count endpoint working
- [ ] Updated `.rest` + Postman JSON

**Definition of Done:** Run app on real Android device. Create a ride request → driver device gets push notification (even if app is closed). Accept → rider device gets push. Complete → both devices get push.

---

# SPRINT 7 — React Web Dashboard (Mobile-Screen UI)
**Scope: React frontend that looks like a phone. Tests every backend flow. Used for QA before mobile app.**
**Estimated days: 6–8**
**Blocked by: Sprints 0–5 (needs working backend)**

## Layout System

**7.0.1 — Phone frame wrapper**
- All content centered in `max-w-[390px]` container with phone shadow
- Mock status bar at top (time, signal, battery)
- Bottom tab navigation: Home | Rides | Wallet | Notifications | Profile
- Scrollable content area within the frame
- Use Tailwind CSS throughout

**7.0.2 — Tech setup**
- React 19 + Vite
- `react-router-dom` v7 for navigation
- `zustand` for state (auth, active ride, wallet)
- `socket.io-client` for real-time events
- `@react-google-maps/api` for map component
- `axios` with interceptors for JWT + auto-refresh
- `react-hot-toast` for notifications
- All API calls in `frontend/src/api/` organized by domain

## Auth Screens

**7.1.1 — Splash screen**
- SG logo centered, auto-redirects to home if token valid, else to login after 2s

**7.1.2 — Phone login screen**
- Phone number input with +977 prefix
- "Send OTP" button → `POST /api/auth/send-otp`
- OTP input (6 boxes, auto-focus next)
- 60-second resend countdown
- On verify: store tokens in localStorage, redirect to home

**7.1.3 — Name entry (new user)**
- If OTP verified but no name: show "What's your name?" screen
- One input, "Continue" → completes registration

## Rider Screens

**7.2.1 — Home / Map**
- Google Map fills the phone frame
- "Where to?" card at bottom (tappable)
- Shows rider's current location
- Nearby driver dots (markers) from `GET /api/ride-requests/drivers/nearby`

**7.2.2 — Destination picker**
- Slide-up bottom sheet
- Pickup (auto-filled with current address via reverse geocode)
- Dropoff search field with Google Places autocomplete
- "Add stop" button (repeating component, max 5 stops)
- Stops list reorderable
- "See prices" button → calls `/api/ride-requests/estimate`

**7.2.3 — Vehicle selection**
- Shows 3 cards: Bike | Car | SUV
- Each card: icon, vehicle type, fare range, ETA
- Select one → "Request Ride" button activates
- Request Ride → `POST /api/ride-requests` with idempotency key

**7.2.4 — Waiting for bids screen**
- Map with pickup pin and route polyline
- "Looking for drivers..." animated loader
- Bid cards slide up from bottom as bids arrive (socket `bid_placed`)
- Each bid card: driver photo, name, rating, badge (if verified), vehicle, bid amount, message, ETA, Accept button
- Cancel request button with 3-second hold confirmation

**7.2.5 — Ride in progress**
- Map with live driver marker (socket `driver_en_route` updates position)
- Route polyline drawn
- Driver info card at bottom: name, plate, rating, vehicle
- Status chip: "Driver en route" / "Driver arrived" / "Ride started"
- Stops progress bar if multi-stop
- Cancel button (until ride starts)
- Call driver button (opens phone dialer with driver's masked number)

**7.2.6 — Ride completion + review**
- Fare breakdown card: base fare + time fare + distance fare + promo discount = total
- "NPR X has been charged from your wallet" or payment method used
- Star rating (1–5, tap to select)
- Positive tap chips (shown only if ≥ 4 stars)
- Negative tap chips (shown if ≤ 3 stars)
- Safety concern toggle (if negative taps)
- "Submit Review" button
- "Skip" option (grayed but available)

## Driver Screens

**7.3.1 — Driver home**
- Map full screen
- Large Online/Offline pill toggle at top
- Today's earnings chip (NPR 0)
- When online: incoming ride request cards slide from bottom (socket `new_ride_request`)

**7.3.2 — Incoming request card**
- Map shows pickup pin
- Request: pickup → stops → dropoff
- Distance to pickup (km), estimated fare (NPR)
- Stops list if multi-stop
- "Place Bid" button → opens bid amount input + message
- Or "Accept at Estimated Price" if fixed-price request
- Countdown timer bar
- "Skip" button to dismiss

**7.3.3 — Active ride screen**
- Map with route to pickup (then to dropoff after pickup)
- Progress steps: Pick Up → [Stop 1] → [Stop 2] → Drop Off
- Current step highlighted
- "I've Arrived" button (at pickup / stops)
- "Start Ride" button (at pickup after arriving)
- "Departed" button (at stops after arriving)
- "Complete Ride" button (at dropoff)

**7.3.4 — Earnings screen**
- Today / Week / Month toggle tabs
- Summary: total earned, platform fee, net earned, rides count
- Per-ride list (collapsible cards)
- "Request Payout" button → slide-up sheet with amount + bank details

## Wallet Screen (Shared)

**7.4.1 — Wallet home**
- Large balance display
- Quick actions row: Top Up | Send | History
- Recent transactions list (5 items, "View all" link)

**7.4.2 — Top up screen**
- Amount input (keyboard with preset amounts: 100, 200, 500, 1000)
- Payment method selector: eSewa | Khalti | Bank Transfer
- "Pay" button → initiates top-up flow
- Redirects to payment provider's page (or shows Khalti widget)

**7.4.3 — Transaction history**
- Full list with filters: All | Top-up | Ride | Payout | Transfer
- Each item: type icon, description, amount +/-, date

## Admin Screens

**7.5.1 — Admin layout**
- Full-width (not phone frame) for admin
- Sidebar navigation
- Dashboard home with stats cards

**7.5.2 — KYC review**
- List with pending filter
- Click → modal with ID document images, personal info
- Approve / Reject with notes

**7.5.3 — Driver applications**
- List with status filter
- Click → full application details
- Approve / Reject

**7.5.4 — Live rides map**
- Google Map showing all active rides
- Click a ride → side panel with details and force-complete option

**7.5.5 — Payout management**
- Pending payouts table with multi-select
- Batch approve button
- Individual approve/reject with notes

**7.5.6 — User management**
- Users table, search by phone/name
- Click → user detail with wallet balance, ride history, lock/unlock wallet

## 7.6 — Sprint 7 Deliverables
- [ ] Phone frame layout working (390px, bottom nav, status bar)
- [ ] Full OTP login flow in browser
- [ ] Rider: home map → estimate → request → wait for bids (real-time) → accept → track → complete → review
- [ ] Driver: home → toggle online → receive request (real-time) → bid → active ride → complete
- [ ] Wallet: balance, top-up with eSewa/Khalti, transaction history
- [ ] Admin: KYC review, driver applications, live ride map, payout management
- [ ] All socket events update UI in real-time without page refresh
- [ ] Updated `.rest` + Postman JSON

**Definition of Done:** Open rider screen and driver screen side-by-side in two browser windows. Complete a full ride end-to-end with no manual API calls. Admin can see the ride on the live map.

---

# SPRINT 8 — React Native Mobile App
**Scope: iOS + Android apps for riders and drivers. All screens from Sprint 7, native.**
**Estimated days: 12–15**
**Blocked by: Sprint 7 (use web as reference for all screens)**

## 8.1 — Project Setup

**8.1.1 — Initialize Expo project**
- `npx create-expo-app SG --template expo-template-blank-typescript`
- Folder structure:
  ```
  mobile/
    app/               ← Expo Router (file-based routing)
      (auth)/          ← auth screens group
      (rider)/         ← rider tab screens
      (driver)/        ← driver tab screens
      (admin)/         ← admin screens
    components/        ← shared components
    hooks/             ← custom hooks
    store/             ← zustand stores
    api/               ← axios API layer (reuse from web)
    constants/
  ```

**8.1.2 — Core packages**
```bash
npx expo install expo-location expo-notifications expo-image-picker
npx expo install react-native-maps
npx expo install expo-secure-store   # for secure token storage (not localStorage)
npm install @tanstack/react-query    # server state
npm install zustand                  # client state
npm install socket.io-client
npm install axios
npm install @react-navigation/native @react-navigation/bottom-tabs
```

**8.1.3 — API layer**
- Reuse same API structure as web frontend
- Axios interceptor: reads access token from SecureStore, auto-refreshes on 401
- Socket.io client: auto-reconnects, re-authenticates on reconnect

## 8.2 — Permissions (Critical for App Store)

**8.2.1 — app.json configuration**
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "SG needs your location to find nearby drivers and show your position to the driver during the ride.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "SG uses your location in the background while you are the driver in an active ride so riders can track your position.",
        "NSCameraUsageDescription": "SG needs camera access to capture your KYC identity documents.",
        "NSPhotoLibraryUsageDescription": "SG needs photo library access to upload your KYC documents."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

**8.2.2 — Permission request flow**
- Location: ask on first launch of driver home screen with explanation screen before the native prompt
- Notifications: ask after first successful login (not on launch — Apple rejects aggressive permission requests)
- Camera/Gallery: ask at the KYC step where it's needed

## 8.3 — Background Location (Driver)

**8.3.1 — Expo Location background task**
```js
// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  const { locations } = data
  const { latitude, longitude } = locations[0].coords
  // Call API: POST /api/ride-requests/drivers/location
  // Only sends when: driver is online + (has active ride OR interval > 10s)
})

// Start tracking when driver goes online
await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
  accuracy: Location.Accuracy.High,
  timeInterval: 5000,          // every 5 seconds
  distanceInterval: 10,        // or every 10 meters, whichever comes first
  showsBackgroundLocationIndicator: true,  // iOS blue bar
  foregroundService: {         // Android
    notificationTitle: "SG - You're Online",
    notificationBody: "Accepting ride requests"
  }
})
```

**8.3.2 — Battery optimization**
- When driver has NO active ride: update every 15 seconds (not 5)
- When active ride in progress: update every 5 seconds
- When driver goes offline: stop task immediately

## 8.4 — Push Notifications (Expo)

**8.4.1 — Register for push notifications**
```js
// On login success:
const token = await Notifications.getExpoPushTokenAsync()
// Or for FCM direct:
const fcmToken = await messaging().getToken()
await api.auth.registerDevice({ fcm_token: fcmToken, device_type: Platform.OS })
```

**8.4.2 — Notification handlers**
- Foreground: show in-app notification banner (custom component)
- Background: system notification (handled by OS)
- Killed state: `Notifications.addNotificationResponseReceivedListener` on app open
- Deep link from notification: tapping "New Bid" opens the bids screen, tapping "Ride Completed" opens the rating screen

## 8.5 — Map Component

**8.5.1 — React Native Maps + Google Maps**
```json
// app.json
{
  "expo": {
    "android": { "googleServicesFile": "./google-services.json" },
    "ios": { "googleServicesFile": "./GoogleService-Info.plist" }
  }
}
```

**8.5.2 — Map features**
- Current location tracking (blue dot)
- Custom marker for driver (car icon, rotated to heading)
- Route polyline (decoded from `route_polyline` field)
- Animated driver marker movement (smooth position interpolation)
- Auto-fit map to show all pins (pickup + stops + dropoff + driver)

## 8.6 — All App Screens (reference Sprint 7 for UI spec)

Implement every screen from Sprint 7 but in React Native:

**Auth:** Splash, OTP login, name entry
**Rider:** Home/Map, Where to, Vehicle picker, Waiting for bids, Ride in progress, Ride completion + review, Notification history
**Driver:** Home/Map, Incoming request, Active ride, Earnings, Application form
**Shared:** Wallet, Top-up, Payment methods, Transaction history, Profile, KYC, Settings

## 8.7 — App Signing

**8.7.1 — Android**
- Generate keystore: `keytool -genkey -v -keystore sg-release.keystore -alias sg -keyalg RSA -keysize 2048 -validity 10000`
- Store in `mobile/android/app/sg-release.keystore`
- Add signing config to `android/app/build.gradle`
- Keep keystore backed up (losing it = cannot update app)

**8.7.2 — iOS**
- Apple Developer account ($99/year)
- Create App ID, Distribution certificate, Provisioning profile in Apple Developer portal
- Configure in Xcode or via `eas credentials`

**8.7.3 — EAS Build**
```bash
npm install -g eas-cli
eas build --platform android --profile production
eas build --platform ios --profile production
```

## 8.8 — Sprint 8 Deliverables
- [ ] Expo project initialized with all packages
- [ ] All permissions configured correctly for iOS + Android
- [ ] Background location works on both platforms (test: driver goes to background, rider sees location update)
- [ ] Push notifications work in killed state on both platforms
- [ ] All auth screens work (phone OTP)
- [ ] Complete rider flow works on device
- [ ] Complete driver flow works on device
- [ ] Google Maps with route polyline drawn
- [ ] Live driver tracking on rider's map
- [ ] App signs and builds via EAS
- [ ] Updated `.rest` + Postman JSON

**Definition of Done:** Two real devices (one Android, one iOS). Rider on Android creates ride → driver on iOS receives push notification → completes full ride → both get completion push → rating submitted. No crashes.

---

# SPRINT 9 — Production Hardening
**Scope: Server is production-safe. Data is protected. Deploy is automated.**
**Estimated days: 5–6**
**Blocked by: Nothing (can run in parallel with Sprint 7/8)**

## 9.1 — Structured Logging

**9.1.1 — Winston logger**
- Install: `npm install winston winston-daily-rotate-file`
- Create: `backend/src/infrastructure/logger.js`
  - Levels: error, warn, info, http, debug
  - Production: JSON format, daily rotating files (`logs/error-%DATE%.log`, `logs/combined-%DATE%.log`)
  - Development: colorized console output
- Replace ALL `console.log/error/warn` with logger calls
- Log format includes: timestamp, level, message, requestId, userId, path, statusCode, duration

**9.1.2 — Request logging middleware**
- Log every request: method, path, status, duration, IP, userId
- Log every error with stack trace

## 9.2 — Error Tracking (Sentry)

**9.2.1 — Backend**
- Install: `npm install @sentry/node`
- Initialize in `server.js` before any other code
- `Sentry.setupExpressErrorHandler(app)` in `app.js` before errorHandler
- Every unhandled error captured with request context + user context

**9.2.2 — Frontend (web)**
- `npm install @sentry/react`

**9.2.3 — Mobile**
- `npx expo install @sentry/react-native`

## 9.3 — Database Production Config

**9.3.1 — Indexes (critical for performance)**
Add these if not already present:
```sql
-- Rides
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rides_rider_id ON rides(rider_id);

-- Ride requests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ride_requests_status ON ride_requests(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ride_requests_expires_at ON ride_requests(expires_at) WHERE status = 'pending';

-- Driver locations (PostGIS spatial index)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_driver_locations_geom ON driver_locations USING GIST(location);

-- Notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- Refresh tokens
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
```

**9.3.2 — Connection pool tuning**
```js
// DBConnection.js
const pool = new Pool({
  max: 20,              // max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})
```

**9.3.3 — Automated database backups**
- Script: `backend/scripts/backup-db.sh`
  ```bash
  #!/bin/bash
  DATE=$(date +%Y%m%d_%H%M%S)
  pg_dump $DATABASE_URL | gzip > /backups/sg_backup_$DATE.sql.gz
  # Upload to S3: aws s3 cp /backups/sg_backup_$DATE.sql.gz s3://sg-backups/
  # Delete local files older than 7 days
  find /backups -name "*.sql.gz" -mtime +7 -delete
  ```
- Cron: daily at 3am
- Retention: 30 days
- Test restore procedure: documented in `backend/scripts/README.md`

## 9.4 — Nginx + SSL + Domain

**9.4.1 — Nginx config**
```nginx
# /etc/nginx/sites-available/sg-api
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;   # for WebSocket
        proxy_set_header Connection "upgrade";     # for WebSocket
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }
}
```

**9.4.2 — SSL certificate**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
# Auto-renews via cron
```

## 9.5 — PM2 (Zero-Downtime)

**9.5.1 — ecosystem.config.js**
```js
module.exports = {
  apps: [{
    name: 'sg-api',
    script: 'src/server.js',
    instances: 'max',          // one per CPU core
    exec_mode: 'cluster',
    watch: false,
    env_production: {
      NODE_ENV: 'production',
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
}
```

**9.5.2 — Zero-downtime reload**
- Deploy: `pm2 reload sg-api` (not restart) — no connections dropped

## 9.6 — Docker + Docker Compose

**9.6.1 — Dockerfile (multi-stage)**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
```

**9.6.2 — docker-compose.yml (production)**
```yaml
services:
  api:
    build: ./backend
    env_file: .env.production
    depends_on: [postgres, redis]
    restart: unless-stopped

  postgres:
    image: postgis/postgis:16-3.4
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./my_database.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on: [api]
    restart: unless-stopped

volumes:
  pgdata:
```

## 9.7 — GitHub Actions CI/CD

**9.7.1 — `.github/workflows/deploy.yml`**
```yaml
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci && npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - SSH to server
      - git pull
      - npm ci --only=production
      - pm2 reload sg-api
```

## 9.8 — Health Check Endpoint
```
GET /health
Returns:
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "uptime_seconds": 3600,
  "version": "1.0.0"
}
```
Used by load balancer and uptime monitoring (UptimeRobot).

## 9.9 — Sprint 9 Deliverables
- [ ] Winston logging replaces all console.log
- [ ] Sentry capturing errors (backend + web + mobile)
- [ ] All DB indexes created
- [ ] Automated daily backup configured
- [ ] Nginx running with SSL (HTTPS)
- [ ] PM2 cluster mode running
- [ ] Docker Compose brings up entire stack
- [ ] GitHub Actions deploys on merge to main
- [ ] `GET /health` returns correct status
- [ ] `.env.example` documents all env vars
- [ ] Updated `.rest` + Postman JSON

**Definition of Done:** `docker-compose up` on a fresh Ubuntu server brings up the entire stack in under 2 minutes. HTTPS works. Server survives `pm2 reload` with no dropped connections.

---

# SPRINT 10 — App Store + Play Store Submission
**Scope: Both apps submitted to stores and approved.**
**Estimated days: 4–5**
**Blocked by: Sprint 8 (needs working app build)**

## 10.1 — Legal Requirements

**10.1.1 — Privacy Policy**
- Document what data is collected (name, phone, location, payment info)
- How it's stored and protected
- How users can delete their data
- Third-party services used (Google Maps, FCM, eSewa, Khalti, Cloudinary)
- Host at: `https://yourdomain.com/privacy`

**10.1.2 — Terms of Service**
- User responsibilities, driver responsibilities
- Payment terms
- Cancellation policy
- Dispute resolution
- Host at: `https://yourdomain.com/terms`

**10.1.3 — Links in the app**
- Settings screen has links to both
- Both required by Apple + Google before approval

## 10.2 — App Store (iOS)

**10.2.1 — App Store Connect setup**
- Create app record at appstoreconnect.apple.com
- Bundle ID: `com.sg.ridesharing` (must match app.json)
- App name, subtitle, category: "Travel" or "Utilities"
- Age rating: 4+ (no content requiring higher rating)

**10.2.2 — Screenshots required**
- iPhone 6.7" (iPhone 15 Pro Max): 5 screenshots for rider flow
- iPhone 6.5" (iPhone 14 Plus): same 5
- iPad 12.9" (if supporting iPad): optional
- Screenshot content: map screen, booking flow, ride tracking, wallet, driver earnings

**10.2.3 — App Review Notes**
Include in review notes:
- Test account credentials (rider + driver)
- "This is a ride-sharing app. To test driver flow, use driver credentials. Location permission is required to test the core feature."

**10.2.4 — Apple Review Known Issues**
- Background location: must justify in review notes + the NSLocationAlwaysAndWhenInUseUsageDescription must be specific (not generic)
- Payment processing: if doing in-app payments Apple may require 30% cut (eSewa/Khalti are external — no issue. Do NOT use "top up" language that implies virtual currency Apple can claim)
- Driver income: no issues

## 10.3 — Play Store (Android)

**10.3.1 — Google Play Console setup**
- Create app at play.google.com/console
- Package name: `com.sg.ridesharing`
- App signing: use Play App Signing (Google manages the key)

**10.3.2 — Store listing**
- Short description (80 chars): "Book rides, earn as a driver — fast and safe"
- Full description (4000 chars): features, how it works, safety commitment
- Screenshots: phone screenshots (same as iOS)
- Feature graphic: 1024x500px banner

**10.3.3 — Data Safety section**
Google requires declaring:
- Location data: collected, approximate and precise, required for core function
- Personal info: name, phone, financial info
- Financial info: payment methods (not payment card numbers)

## 10.4 — Internal Testing Before Submission

**10.4.1 — Test checklist (on real devices)**
- [ ] OTP login works (real phone number, real SMS)
- [ ] Location permission granted → map shows correct position
- [ ] Background location: driver goes to background → rider sees location move
- [ ] Push notification in killed state
- [ ] Complete a ride end-to-end on real devices
- [ ] Wallet top-up via eSewa/Khalti live (not sandbox)
- [ ] Rating submission
- [ ] KYC document upload (camera + gallery)
- [ ] App works on slow 3G connection (not just WiFi)
- [ ] App handles network disconnection gracefully

## 10.5 — Sprint 10 Deliverables
- [ ] Privacy Policy + ToS pages live at public URLs
- [ ] iOS app submitted to App Store Review
- [ ] Android app published to Play Store (internal testing track first, then production)
- [ ] All screenshots prepared
- [ ] Data safety forms completed
- [ ] Test accounts documented for reviewers

**Definition of Done:** Both apps have a submission in review. Android live on internal testing track and downloadable via Play Console link.

---

# SPRINT 11 — Analytics, Operations & Surge Pricing
**Scope: Admin can see what's happening. Surge pricing. System monitoring.**
**Estimated days: 4–5**
**Blocked by: Sprint 9**

## 11.1 — Analytics Endpoints

```
GET /api/admin/analytics/overview?period=today|week|month
  Returns: active_rides, total_rides, completed_rides, cancelled_rides,
           total_revenue, platform_fees, new_users, new_drivers

GET /api/admin/analytics/rides?from=&to=
  Returns: rides_by_status breakdown, average_fare, cancellation_rate,
           average_rating, peak_hours_chart_data

GET /api/admin/analytics/drivers?from=&to=
  Returns: active_drivers, average_online_hours, rides_per_driver,
           top_10_drivers_by_earnings, drivers_by_safety_level

GET /api/admin/analytics/finance?from=&to=
  Returns: gross_bookings, platform_fees_collected, payout_volume,
           wallet_top_ups, refunds_issued, net_revenue

GET /api/admin/analytics/geography
  Returns: GeoJSON heatmap of ride request origins (PostGIS)
           Used to show where most rides are being requested from
```

## 11.2 — Surge Pricing

**11.2.1 — Surge multiplier system**
- `surges` table: `{ id, area_name, lat, lng, radius_km, multiplier, reason, starts_at, ends_at, created_by }`
- `GET /api/admin/surge` — list active surges
- `POST /api/admin/surge` — create surge: area + multiplier + reason + end time
- `DELETE /api/admin/surge/:id` — end surge early
- Fare estimation checks for active surges at pickup location
- Surge indicator shown to rider on vehicle selection screen: "⚡ High demand - 1.5x"

## 11.3 — Admin Notifications
- Email notification to admin when:
  - New driver application submitted
  - Safety concern filed
  - Payout batch ready for processing
  - Ledger verification fails
  - Server error rate spikes

## 11.4 — Operations Dashboard (Admin Sprint 7 screen expanded)
- Real-time active ride count
- Live driver map with all online drivers
- Driver heatmap
- Surge pricing zones drawn on map
- Revenue chart (daily/weekly/monthly)

## 11.5 — Sprint 11 Deliverables
- [ ] All analytics endpoints working
- [ ] Analytics charts rendered in admin dashboard
- [ ] Surge pricing create/view/end works
- [ ] Surge multiplier applied to fare estimation + ride payments
- [ ] Admin email notifications configured
- [ ] Live operations map shows online drivers + active rides
- [ ] Updated `.rest` + Postman JSON

---

# SPRINT 12 — Final QA, Performance & Launch Prep
**Scope: Stress test, fix everything found, performance tune, go live.**
**Estimated days: 4–5**
**Blocked by: All previous sprints**

## 12.1 — Load Testing
- Install: `k6` or `artillery`
- Test scenarios:
  - 100 concurrent users creating ride requests
  - 50 concurrent drivers updating location every 5s
  - 200 concurrent users checking wallet balance
- Target: API handles 300 req/s with < 200ms p95 response time
- Fix any bottlenecks found (missing indexes, N+1 queries, missing caching)

## 12.2 — End-to-End QA Checklist
- [ ] Full rider flow on iOS
- [ ] Full rider flow on Android
- [ ] Full driver flow on iOS
- [ ] Full driver flow on Android
- [ ] Real payment via eSewa
- [ ] Real payment via Khalti
- [ ] KYC submission and admin approval
- [ ] Driver application and approval
- [ ] Multi-stop ride with stops tracking
- [ ] Ride cancel (before accept, after accept, after start)
- [ ] Promo code applied and deducted
- [ ] Gift card purchase → redeem → use on ride
- [ ] Payout request → admin approve → driver notified
- [ ] Safety concern filed → driver visibility reduced
- [ ] App survives network drop during active ride
- [ ] App survives phone kill during active ride (state restored on reopen)
- [ ] Socket reconnects after 5-minute background

## 12.3 — Performance Fixes
- Cache frequently-read, rarely-changed data in Redis (payment providers, vehicle types/rates)
- Add database query explain-analyze on slowest 10 endpoints
- Enable Postgres query statistics: `pg_stat_statements`
- Optimize any query taking > 100ms

## 12.4 — Go Live Checklist
- [ ] All `.env` vars set on production server
- [ ] SSL certificate active and auto-renewing
- [ ] Database backup ran successfully at least once
- [ ] Sentry receiving events from production
- [ ] UptimeRobot monitoring `/health` endpoint
- [ ] Firebase FCM sending real notifications
- [ ] eSewa merchant account approved for live
- [ ] Khalti merchant account approved for live
- [ ] Google Maps API key restricted to production domains/IPs
- [ ] Both apps approved in app stores
- [ ] Support channel set up (email/WhatsApp for user issues)

---

# REVISED SPRINT SUMMARY

| Sprint | Focus | Days | Blocked By |
|--------|-------|------|-----------|
| **0** | Critical security fixes + all broken endpoints fixed | 3–4 | Nothing |
| **1** | Google Maps integration + real fare calculation | 3–4 | 0 |
| **2** | Phone OTP + SMS + refresh tokens + rate limiting + validation | 4–5 | 0 |
| **3** | eSewa + Khalti live integration + promo on rides + ledger complete | 4–5 | 0 |
| **4** | Stops everywhere + all socket events + live driver tracking | 3–4 | 1 |
| **5** | Driver profile + safety scoring + badges + matching algorithm | 4–5 | 0 |
| **6** | FCM push notifications + notification centre | 3–4 | 2 |
| **7** | React web dashboard (mobile-screen UI, full flows) | 6–8 | 0–5 |
| **8** | React Native mobile app (iOS + Android) | 12–15 | 7 |
| **9** | Production hardening (Nginx, SSL, PM2, Docker, CI/CD, backups) | 5–6 | Nothing |
| **10** | App Store + Play Store submission + Privacy Policy + ToS | 4–5 | 8 |
| **11** | Analytics + surge pricing + operations dashboard | 4–5 | 9 |
| **12** | Load testing + final QA + go live | 4–5 | All |
| **Total** | | **~60–74 days** | |

---

# AFTER SPRINT 12: IS THE PROJECT DONE?

**Yes. Technically production-ready to compete with Pathao/InDrive.**

What you will have:
- ✅ Hardened backend (auth, validation, rate limiting, no broken endpoints)
- ✅ Real map integration (road distance, real ETAs, address search)
- ✅ Real OTP login (phone-first, Nepali SMS)
- ✅ Real payments (eSewa + Khalti live)
- ✅ Complete wallet system (top-up, rides, payouts, ledger)
- ✅ Real-time everything (socket events for every state change)
- ✅ Push notifications on every event
- ✅ Stops working throughout
- ✅ Driver safety score + badge system
- ✅ React web dashboard for QA (mobile-screen UI)
- ✅ React Native apps on App Store + Play Store
- ✅ HTTPS + Nginx + PM2 cluster + automated backups
- ✅ CI/CD on every merge
- ✅ Sentry error tracking
- ✅ Analytics dashboard
- ✅ Surge pricing
- ✅ Load-tested at 300 req/s

What comes AFTER launch (post v1.0, based on user feedback):
- In-app chat (rider ↔ driver during ride)
- Scheduled rides (book for tomorrow)
- Referral system
- Corporate accounts
- Fare splitting
- Multi-language (Nepali)
- SOS emergency dispatch integration
- Dynamic surge (auto-triggers based on demand, not manual admin toggle)
