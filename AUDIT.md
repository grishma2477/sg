# SG Ride-Sharing — Full Backend Audit
_Performed: 2026-06-24 | Auditor: Claude Sonnet 4.6_

---

## SUMMARY SCORECARD

| Area | Status |
|------|--------|
| Server startup & DB connection | ✅ |
| Auth (register/login/JWT) | ✅ with issues |
| KYC workflow | ✅ |
| Driver application | ⚠️ scoping bug |
| Driver status toggle | ✅ |
| Driver location (update) | ❌ broken |
| Driver location (nearby) | ❌ broken |
| Ride request creation | ✅ (no real-time broadcast) |
| Bidding flow | ✅ partial |
| Ride lifecycle (accept/start/complete/cancel) | ✅ |
| Stops in ride | ✅ arrive/depart work |
| Reviews & safety taps | ✅ (Redis dependency) |
| Wallet operations | ✅ |
| Payment methods | ❌ 2 of 3 methods missing |
| Payment details lookup | ❌ method missing |
| Payment providers (admin) | ❌ no auth middleware |
| Ride payments | ✅ |
| Payouts (full lifecycle) | ✅ |
| Promo codes | ✅ |
| Gift cards | ✅ |
| Admin user CRUD | ✅ |
| Admin ride management | ✅ (minor bug) |
| Admin review management | ✅ |
| Driver profile routes | ❌ NOT MOUNTED |
| Admin badge routes | ❌ NOT MOUNTED |
| Safety comment routes | ❌ NOT MOUNTED (+ broken import) |

---

## SECTION 1 — ENTRY POINTS

### server.js
- Listens on `PORT` env var or 5000
- On startup: connects DB → `LedgerService.initializePlatformAccounts()` → `runExpireRideRequestsWorker()` → Socket.io
- Handles `unhandledRejection` and `uncaughtException` globally ✅

### app.js
- Middleware stack: `cors()` → `express.json()` → `fileUpload({ useTempFiles: true })` → routes → `errorHandler`
- **4 route files defined but NOT mounted**: `driverProfileRoutes`, `driverRoutes` (verification), `adminBadgeRoutes`, `safetyCommentRoutes`

---

## SECTION 2 — COMPLETE ROUTE MAP

| # | Method | Path | Controller | Auth | Status |
|---|--------|------|-----------|------|--------|
| 1 | POST | /api/auth/register | authController.register | None | ✅ |
| 2 | POST | /api/auth/login | authController.login | None | ✅ |
| 3 | GET | /api/kyc/status | kycController.getKYCStatus | JWT | ✅ |
| 4 | POST | /api/kyc/complete | kycController.completeKYC | JWT | ✅ |
| 5 | GET | /api/kyc/pending | kycController.getPendingKYCs | JWT+Admin | ✅ |
| 6 | GET | /api/kyc/:userId | kycController.getKYCDetails | JWT+Admin | ✅ |
| 7 | POST | /api/kyc/verify/:userId | kycController.verifyKYC | JWT+Admin | ✅ |
| 8 | GET | /api/driver-applications/check | driverApplicationController.checkApplication | JWT | ✅ |
| 9 | POST | /api/driver-applications/submit | driverApplicationController.submitApplication | JWT | ✅ |
| 10 | GET | /api/driver-applications/pending | driverApplicationController.getPendingApplications | JWT+Admin | ✅ |
| 11 | GET | /api/driver-applications/:id | driverApplicationController.getApplicationDetails | JWT+Admin | ✅ |
| 12 | POST | /api/driver-applications/:id/review | driverApplicationController.reviewApplication | JWT+Admin | ⚠️ scoping bug |
| 13 | POST | /api/drivers/toggle-status | driverStatusController.toggleDriverStatus | JWT | ✅ |
| 14 | GET | /api/drivers/status | driverStatusController.getDriverStatus | JWT | ✅ |
| 15 | POST | /api/ride-requests | rideRequestController.createRideRequest | JWT+Idempotency | ✅ |
| 16 | GET | /api/ride-requests/nearby | rideRequestController.getNearbyRideRequests | JWT | ✅ |
| 17 | GET | /api/ride-requests | rideRequestController.getRiderRequests | JWT | ✅ |
| 18 | GET | /api/ride-requests/:id | rideRequestController.getRideRequestDetails | JWT | ✅ |
| 19 | PUT | /api/ride-requests/:id/cancel | rideRequestController.cancelRideRequest | JWT | ✅ |
| 20 | POST | /api/ride-requests/drivers/location | rideRequestController.updateDriverLocation | JWT | ❌ req.user.driverId undefined |
| 21 | GET | /api/ride-requests/drivers/location/:id | driverLocationController.getDriverLocation | JWT | ✅ |
| 22 | GET | /api/ride-requests/drivers/nearby | driverLocationController.getNearbyDrivers | JWT | ❌ pool not imported |
| 23 | POST | /api/bidding/requests/:id/submit | biddingController.submitBid | JWT | ✅ |
| 24 | GET | /api/bidding/requests/:id/bids | biddingController.getRideRequestBids | JWT | ✅ |
| 25 | POST | /api/bidding/bids/:id/accept | biddingController.acceptBid | JWT | ✅ |
| 26 | GET | /api/rides/:rideId | rideController.getRideDetails | JWT | ✅ |
| 27 | POST | /api/rides/accept/:requestId | rideController.acceptRideRequest | JWT+Driver+Idempotency | ✅ |
| 28 | POST | /api/rides/:rideId/start | rideController.startRide | JWT+Driver+Idempotency | ✅ |
| 29 | POST | /api/rides/:rideId/stops/:stopId/arrive | rideController.arriveAtStop | JWT | ✅ |
| 30 | POST | /api/rides/:rideId/stops/:stopId/depart | rideController.departFromStop | JWT | ✅ |
| 31 | POST | /api/rides/:rideId/complete | rideController.completeRide | JWT+Driver+Idempotency | ✅ |
| 32 | POST | /api/rides/:rideId/cancel | rideController.cancelRide | JWT+Idempotency | ✅ |
| 33 | POST | /api/reviews/ | reviewController.submitReview | JWT | ✅ (needs Redis) |
| 34 | GET | /api/payments/balance | paymentController.getWalletBalance | JWT | ✅ |
| 35 | GET | /api/payments/history | paymentController.getAccountHistory | JWT | ✅ |
| 36 | GET | /api/payments/:paymentId | paymentController.getPaymentDetails | JWT | ❌ method missing in service |
| 37 | GET | /api/payments/providers | adminPaymentProviderController.getUserProviders | JWT | ❌ pool not imported in service |
| 38 | POST | /api/payments/providers | paymentController.createPaymentProvider | JWT+Admin | ✅ |
| 39 | POST | /api/payments/webhook/gateway | paymentController.handleGatewayWebhook | None | ✅ |
| 40 | POST | /api/payments/methods | paymentMethodController.addPaymentMethod | JWT | ✅ |
| 41 | GET | /api/payments/methods | paymentMethodController.getUserPaymentMethods | JWT | ❌ method missing in service |
| 42 | PATCH | /api/payments/methods/:id/default | paymentMethodController.setDefaultPaymentMethod | JWT | ✅ |
| 43 | DELETE | /api/payments/methods/:id | paymentMethodController.deletePaymentMethod | JWT | ❌ method missing in service |
| 44 | GET | /api/wallet/balance | walletController.getWalletBalance | JWT | ✅ |
| 45 | POST | /api/wallet/topup | walletController.topUpWallet | JWT+Idempotency | ✅ |
| 46 | POST | /api/wallet/withdraw | walletController.withdrawFromWallet | JWT+Idempotency | ✅ |
| 47 | POST | /api/wallet/transfer | walletController.transferFunds | JWT+Idempotency | ✅ |
| 48 | GET | /api/wallet/transactions | walletController.getTransactionHistory | JWT | ✅ |
| 49 | GET | /api/wallet/ride-payments | ridePaymentController.getUserPaymentHistory | JWT | ✅ |
| 50 | GET | /api/wallet/payment-stats | ridePaymentController.getPaymentStats | JWT | ✅ |
| 51 | GET | /api/wallet/ride-payments/:rideId | ridePaymentController.getRidePaymentDetails | JWT | ✅ |
| 52 | POST | /api/wallet/ride-payments/:rideId/cancel | ridePaymentController.cancelRidePayment | JWT+Idempotency | ✅ |
| 53 | POST | /api/wallet/admin/:userId/lock | walletController.lockWallet | JWT+Admin | ✅ |
| 54 | POST | /api/wallet/admin/:userId/unlock | walletController.unlockWallet | JWT+Admin | ✅ |
| 55 | POST | /api/payouts/request | payoutController.requestPayout | JWT+Driver | ✅ |
| 56 | GET | /api/payouts/history | payoutController.getMyPayoutHistory | JWT+Driver | ✅ |
| 57 | GET | /api/payouts/balance | payoutController.getAvailableBalance | JWT+Driver | ✅ |
| 58 | GET | /api/payouts/admin/pending | payoutController.getPendingPayouts | JWT+Admin | ✅ |
| 59 | GET | /api/payouts/admin/approved | payoutController.getApprovedPayouts | JWT+Admin | ✅ |
| 60 | POST | /api/payouts/admin/:id/approve | payoutController.approvePayout | JWT+Admin | ✅ |
| 61 | POST | /api/payouts/admin/:id/reject | payoutController.rejectPayout | JWT+Admin | ✅ |
| 62 | POST | /api/payouts/admin/batch | payoutController.createPayoutBatch | JWT+Admin | ✅ |
| 63 | GET | /api/payouts/admin/batches | payoutController.getPayoutBatches | JWT+Admin | ✅ |
| 64 | GET | /api/payouts/admin/batch/:id | payoutController.getBatchDetails | JWT+Admin | ✅ |
| 65 | POST | /api/payouts/admin/:id/retry | payoutController.retryFailedPayout | JWT+Admin | ✅ |
| 66 | POST | /api/promo-gift/promo/validate | promoCodeController.validatePromoCode | JWT | ✅ |
| 67 | GET | /api/promo-gift/promo/:code | promoCodeController.getPromoCode | JWT | ✅ |
| 68 | GET | /api/promo-gift/promo-history | promoCodeController.getUserPromoHistory | JWT | ✅ |
| 69 | POST | /api/promo-gift/admin/promo/create | promoCodeController.createPromoCode | JWT+Admin | ✅ |
| 70 | PUT | /api/promo-gift/admin/promo/:code/update | promoCodeController.updatePromoCode | JWT+Admin | ✅ |
| 71 | POST | /api/promo-gift/admin/promo/:code/deactivate | promoCodeController.deactivatePromoCode | JWT+Admin | ✅ |
| 72 | GET | /api/promo-gift/admin/promo/list | promoCodeController.listPromoCodes | JWT+Admin | ✅ |
| 73 | GET | /api/promo-gift/admin/promo/stats | promoCodeController.getPromoStats | JWT+Admin | ✅ |
| 74 | GET | /api/promo-gift/admin/promo/redemptions | promoCodeController.getAllPromoRedemptions | JWT+Admin | ✅ |
| 75 | POST | /api/promo-gift/gift-card/purchase | giftCardController.purchaseGiftCard | JWT | ✅ |
| 76 | GET | /api/promo-gift/gift-card/:code/balance | giftCardController.checkBalance | JWT | ✅ |
| 77 | POST | /api/promo-gift/gift-card/redeem | giftCardController.redeemToWallet | JWT | ✅ |
| 78 | POST | /api/promo-gift/gift-card/transfer | giftCardController.transferGiftCard | JWT | ✅ |
| 79 | GET | /api/promo-gift/gift-cards | giftCardController.getUserGiftCards | JWT | ✅ |
| 80 | GET | /api/promo-gift/gift-card/:code/history | giftCardController.getRedemptionHistory | JWT | ✅ |
| 81 | GET | /api/promo-gift/admin/gift-cards/list | giftCardController.getAllGiftCards | JWT+Admin | ✅ |
| 82 | GET | /api/promo-gift/admin/gift-cards/stats | giftCardController.getGiftCardStats | JWT+Admin | ✅ |
| 83 | GET | /api/promo-gift/admin/gift-cards/redemptions | giftCardController.getAllGiftCardRedemptions | JWT+Admin | ✅ |
| 84 | POST | /api/promo-gift/admin/gift-card/:code/cancel | giftCardController.cancelGiftCard | JWT+Admin | ✅ |
| 85 | GET | /api/admin/manage/users | adminUserController.getAllUsers | JWT+Admin | ✅ |
| 86 | GET | /api/admin/manage/users/stats | adminUserController.getUserStats | JWT+Admin | ✅ |
| 87 | GET | /api/admin/manage/users/:userId | adminUserController.getUserById | JWT+Admin | ✅ |
| 88 | POST | /api/admin/manage/users | adminUserController.createUser | JWT+Admin | ✅ |
| 89 | PUT | /api/admin/manage/users/:userId | adminUserController.updateUser | JWT+Admin | ✅ |
| 90 | DELETE | /api/admin/manage/users/:userId | adminUserController.deleteUser | JWT+Admin | ✅ |
| 91 | POST | /api/admin/rides | adminRideController.createRide | JWT+Admin | ⚠️ catch bug |
| 92 | GET | /api/admin/rides/:id | adminRideController.getRide | JWT+Admin | ✅ |
| 93 | PUT | /api/admin/rides/:id | adminRideController.updateRide | JWT+Admin | ✅ |
| 94 | DELETE | /api/admin/rides/:id | adminRideController.deleteRide | JWT+Admin | ✅ |
| 95 | POST | /api/admin/rides/:id/force-complete | adminRideController.forceCompleteRide | JWT+Admin | ✅ |
| 96 | POST | /api/admin/reviews | adminReviewController.createReview | JWT+Admin | ✅ |
| 97 | GET | /api/admin/reviews/:id | adminReviewController.getReview | JWT+Admin | ✅ |
| 98 | PUT | /api/admin/reviews/:id | adminReviewController.updateReview | JWT+Admin | ✅ |
| 99 | POST | /api/admin/reviews/:id/flag | adminReviewController.flagReview | JWT+Admin | ✅ |
| 100 | DELETE | /api/admin/reviews/:id | adminReviewController.deleteReview | JWT+Admin | ✅ |
| 101 | POST | /api/admin/payment-providers | adminPaymentProviderController.createProvider | ❌ NO AUTH | ⚠️ |
| 102 | GET | /api/admin/payment-providers | adminPaymentProviderController.getProviders | ❌ NO AUTH | ⚠️ |
| 103 | PUT | /api/admin/payment-providers/:id | adminPaymentProviderController.updateProvider | ❌ NO AUTH | ⚠️ |
| 104 | PATCH | /api/admin/payment-providers/:id/deactivate | adminPaymentProviderController.deactivateProvider | ❌ NO AUTH | ⚠️ |

**Dead routes (files exist, not mounted in app.js):**
- Driver Profile: POST/GET `/api/drivers/profile` (create-profile, get profile)
- Driver Verification: GET `/api/drivers/verification-status`
- Admin Badges: GET/PUT/POST `/api/admin/drivers/badges`
- Safety Comments: GET/POST safety comment endpoints

---

## SECTION 3 — BUGS & BROKEN CODE (Priority Order)

### 🔴 CRITICAL (crashes or security hole)

**BUG-01 — adminPaymentProviderRoutes.js: No authentication**
- File: `backend/src/routes/adminPaymentProviderRoutes.js`
- Problem: `router.use(requireRole("admin"))` runs with no `verifyuser` before it, so `req.user` is undefined. Any unauthenticated caller can create/modify payment providers.
- Fix: Add `import { verifyuser } from "../middleware/auth.js"` and `router.use(verifyuser)` as the FIRST middleware on the router.

**BUG-02 — auth.js: jwt.verify() not in try-catch**
- File: `backend/src/middleware/auth.js`
- Problem: An expired or malformed token throws synchronously, bypasses the JSON error handler, and returns an HTML 500 page.
- Fix: Wrap `jwt.verify()` in try-catch and return `res.status(401).json(...)` in the catch.

**BUG-03 — authController.js: hardcoded JWT secret fallback**
- File: `backend/src/controllers/authController.js`
- Problem: `process.env.ACCESS_TOKEN_SECRET_KEY || 'your-secret-key'` — if the env var is missing, tokens are signed with a public string.
- Fix: Remove the fallback. Throw a startup error if the secret is missing.

**BUG-04 — driverLocationController.getNearbyDrivers: pool not imported**
- File: `backend/src/controllers/driverLocationController.js`
- Problem: `pool.query()` called, `pool` never imported → `ReferenceError` at runtime.
- Fix: Add `import { pool } from "../database/DBConnection.js"` at top of file.

**BUG-05 — PaymentProviderService.getUserAvailableProviders: pool not imported**
- File: `backend/src/application/services/PaymentProviderService.js`
- Problem: Same as BUG-04 — `pool.query()` without import → `ReferenceError`.
- Fix: Add the pool import.

### 🟠 HIGH (endpoint always 500s)

**BUG-06 — PaymentService: getPaymentDetails() method missing**
- File: `backend/src/application/services/PaymentService.js`
- Problem: `paymentController.getPaymentDetails` calls `PaymentService.getPaymentDetails(paymentId)` — method doesn't exist → `TypeError`.
- Fix: Implement the method. Query `ride_payments` by ID with user ownership check.

**BUG-07 — PaymentMethodService: getUserPaymentMethods() and deletePaymentMethod() missing**
- File: `backend/src/application/services/PaymentMethodService.js`
- Problem: Both methods were present in old code but removed during refactor. Controllers still call them → `TypeError`.
- Fix: Re-implement both methods.

**BUG-08 — rideRequestController.updateDriverLocation: req.user.driverId is always undefined**
- File: `backend/src/controllers/rideRequestController.js`
- Problem: `req.user` is a `users` table row; it has no `driverId` field. The driver ID is in the `drivers` table. Location update inserts with `undefined` driver ID.
- Fix: Query `SELECT id FROM drivers WHERE user_id = $1` after auth, then use that ID.

### 🟡 MEDIUM (logic errors / silent failures)

**BUG-09 — RideRequestService: String.REQUEST_EXPIRY_MINUTES is undefined**
- File: `backend/src/application/services/RideRequestService.js` + `backend/src/utils/Constant.js`
- Problem: `moment().add(undefined, 'minutes')` → expiry timestamp equals now → requests expire immediately.
- Fix: Add `REQUEST_EXPIRY_MINUTES: 5` (or appropriate value) to `Constant.js` `String` object.

**BUG-10 — driverApplicationController.reviewApplication: driverId scoping bug**
- File: `backend/src/controllers/driverApplicationController.js`
- Problem: `driverId` is set inside an `if (driverExists.rows.length === 0)` block as `const`. When a driver already exists and the code falls through to `LedgerService.getOrCreateAccount({ ownerId: driverId })`, `driverId` is undefined in the outer scope.
- Fix: Declare `let driverId` at function top; assign in both if/else branches.

**BUG-11 — adminRideController.createRide: return(err) in catch**
- File: `backend/src/controllers/adminRideController.js`
- Problem: Catch block has `return(err)` — this returns `err` to Express which does nothing with it. Response hangs with no status sent.
- Fix: Change to `next(err)`.

**BUG-12 — Bidding platform fee inconsistency**
- Files: `biddingController.js` (hardcoded 20%) vs `RidePaymentService.js` (reads from config)
- Problem: Riders and drivers see inconsistent fee calculations depending on which flow is used.
- Fix: Move platform fee to `Constant.js` and use it in both places.

**BUG-13 — createRideRequest: no real-time broadcast to drivers**
- File: `backend/src/controllers/rideRequestController.js`
- Problem: Ride request is created in DB but no Socket.io event is emitted to nearby drivers. Drivers must poll `GET /nearby`.
- Fix: After inserting, emit `new_ride_request` socket event to nearby online drivers.

### 🟢 LOW (cosmetic / future risk)

**BUG-14 — authController.register: hardcoded KYC sentinel values**
- File: `backend/src/controllers/authController.js`
- Problem: `date_of_birth: '2000-01-01'`, `address: 'To be updated'`, `gender: 'male'`, `blood_group: 'O+'` inserted into KYC table on every registration.
- Fix: Don't create a KYC row on registration. Create it when the user submits their KYC.

**BUG-15 — safetyCommentRoutes.js: broken import (not mounted, but would crash)**
- File: `backend/src/routes/safetyCommentRoutes.js`
- Problem: `import { verifyuser, requireRole } from "../middleware/auth.js"` — `requireRole` is not exported from `auth.js` (it's in `requireRole.js`). Would crash at startup if mounted.
- Fix: `import { requireRole } from "../middleware/requireRole.js"`.

**BUG-16 — paymentRoutes.js: duplicate GET /:paymentId route**
- File: `backend/src/routes/paymentRoutes.js`
- Problem: Two `router.get('/:paymentId', ...)` definitions. First one wins silently.
- Fix: Remove the duplicate.

---

## SECTION 4 — WHAT IS WORKING (Production-Ready)

1. **Auth**: Register + Login + JWT issuance/verification
2. **KYC workflow**: Submit docs → Admin review → Approve/Reject → Socket notification
3. **Driver application**: Submit → Admin review → Approve (creates driver record + safety stats + ledger account)
4. **Driver online/offline toggle**: Updates `driver_locations` with PostGIS point
5. **Ride request creation**: Direct SQL, Haversine distance estimate, stops stored
6. **Ride request cancellation**: Via RideRequestService
7. **Nearby ride requests**: PostGIS radius query for drivers
8. **Bidding**: Submit bid → List bids → Accept bid (with payment hold authorization)
9. **Fixed-price ride acceptance**: Accept → authorize payment hold via RidePaymentService
10. **Ride lifecycle**: Start → Arrive at stop → Depart from stop → Complete (payment settlement) → Cancel (refund)
11. **Double-entry ledger**: Full implementation — platform accounts initialized on boot
12. **Wallet**: Top-up, withdraw, transfer, transaction history, admin lock/unlock
13. **Payment holds**: Tracked correctly through ride lifecycle
14. **Ride payments**: Full history, stats, per-ride details, cancel/refund
15. **Payout system**: Full lifecycle — request → admin approve/reject → batch → process → retry
16. **Promo codes**: Full CRUD, validation against ride amount, usage tracking
17. **Gift cards**: Purchase, redeem to wallet, transfer, admin cancel
18. **Admin user CRUD**: Complete with pagination
19. **Admin ride management**: View, update, force-complete, delete
20. **Admin review management**: Full CRUD with audit log via AdminAuditService
21. **Idempotency**: SHA-256 keyed idempotency on all critical mutations
22. **Role-based access control**: `requireRole` middleware correct on most routes
23. **Global error handler**: `errorHandler` registered, `AppError` used in services
24. **Socket.io**: KYC notifications, ride started/completed events emitted
25. **Ride expiry worker**: `runExpireRideRequestsWorker` runs on startup

---

## SECTION 5 — WHAT IS INCOMPLETE / MISSING ENTIRELY

### Features with no code at all:

1. **Real-time driver broadcast on ride request** — when a rider creates a request, nearby online drivers should get a socket push. Currently they must poll.
2. **Driver profile endpoint** — `POST /api/drivers/create-profile` exists in a route file but the route file is not mounted.
3. **Driver verification status endpoint** — route file exists, not mounted.
4. **Safety comment system** — full service + controller + routes exist but routes have a broken import and are not mounted.
5. **Admin badge management** — service + controller + routes exist but routes not mounted.
6. **Push notifications** — no FCM/APNS integration for mobile app (critical for production mobile).
7. **Fare estimation API** — `TaskList.mf.md` lists "Rider-side price estimation" as missing. There is `PricingCalculationService.js` but no endpoint that exposes fare estimates before creating a ride request.
8. **Stops not showing on driver/bid side** — `TaskList.mf.md` bug. Stops are saved on request creation but the `getRideRequestBids` and `getNearbyRideRequests` queries likely don't JOIN to stops table.
9. **Refresh token endpoint** — JWT is issued but there's no `/api/auth/refresh` endpoint. Mobile app will need this.
10. **Logout endpoint** — no token invalidation or blacklist mechanism.
11. **Rate limiting** — no `express-rate-limit` on auth endpoints. Brute force is possible.
12. **Input validation** — no Joi/Zod/express-validator on any endpoint. Malformed requests rely on DB constraints to catch errors.
13. **Redis error handling** — ReviewSubmissionService, adminController all import Redis. If Redis is down, these modules fail on import with no graceful degradation.
14. **Background job monitoring** — Bull queue (safetyQueue) has no admin UI or failure alerting.
15. **Ride request price min/max** — DriverMatchingService references `estimated_fare_min/max` but createRideRequest only stores `estimated_total`. Schema mismatch.

---

## SECTION 6 — FIXES IN ORDER OF PRIORITY

### Sprint 1 — Critical Fixes (do these before any testing)

| # | File | Fix |
|---|------|-----|
| 1 | `routes/adminPaymentProviderRoutes.js` | Add `verifyuser` middleware before `requireRole` |
| 2 | `middleware/auth.js` | Wrap `jwt.verify()` in try-catch → return 401 JSON |
| 3 | `controllers/authController.js` | Remove `\|\| 'your-secret-key'` fallback |
| 4 | `controllers/driverLocationController.js` | Import `pool` |
| 5 | `services/PaymentProviderService.js` | Import `pool` |
| 6 | `utils/Constant.js` | Add `REQUEST_EXPIRY_MINUTES: 5` to `String` object |

### Sprint 2 — Broken Endpoints

| # | File | Fix |
|---|------|-----|
| 7 | `services/PaymentService.js` | Implement `getPaymentDetails(paymentId, userId)` |
| 8 | `services/PaymentMethodService.js` | Re-implement `getUserPaymentMethods(userId)` and `deletePaymentMethod(methodId, userId)` |
| 9 | `controllers/rideRequestController.js` | Fix `updateDriverLocation` — query driver ID from DB |
| 10 | `controllers/driverApplicationController.js` | Fix `driverId` scoping in `reviewApplication` |
| 11 | `controllers/adminRideController.js` | Change `return(err)` to `next(err)` in createRide catch |

### Sprint 3 — Mount Missing Routes + Fix Imports

| # | Action |
|---|--------|
| 12 | Fix `safetyCommentRoutes.js` broken import (`requireRole` from wrong file) |
| 13 | Mount `driverProfileRoutes`, `driverRoutes` (verification), `adminBadgeRoutes`, `safetyCommentRoutes` in `app.js` |

### Sprint 4 — Feature Completion

| # | Feature | Notes |
|---|---------|-------|
| 14 | Fare estimation endpoint | Expose `PricingCalculationService` via `GET /api/ride-requests/estimate` |
| 15 | Stops in bid/nearby responses | JOIN stops in `getNearbyRideRequests` and `getRideRequestBids` queries |
| 16 | Real-time ride request broadcast | Emit socket event to nearby drivers on `createRideRequest` |
| 17 | Refresh token endpoint | `POST /api/auth/refresh` — verify refresh token, issue new access token |
| 18 | Logout endpoint | `POST /api/auth/logout` — invalidate refresh token |
| 19 | Rate limiting | Add `express-rate-limit` to `/api/auth/login` and `/api/auth/register` |
| 20 | Input validation | Add `express-validator` or Zod schemas to all write endpoints |
| 21 | Push notifications | Integrate FCM for mobile ride notifications |

---

## SECTION 7 — INFRASTRUCTURE DEPENDENCIES

These must be running for full functionality:

| Service | Used By | Required For |
|---------|---------|-------------|
| PostgreSQL + PostGIS | Everything | Core data |
| Redis | ReviewSubmissionService, adminController | Review processing, caching |
| Bull queue (safetyQueue) | ReviewSubmissionService | Background safety point calculation |
| Cloudinary | kycController | Document image uploads |
| Socket.io | socketServer.js | Real-time ride/KYC events |

**Production checklist:**
- `ACCESS_TOKEN_SECRET_KEY` env var set (strong random value)
- `REFRESH_TOKEN_SECRET_KEY` env var set
- `ACCESS_TOKEN_EXPIRATION_TIME` env var set (e.g. `15m`)
- `REFRESH_TOKEN_EXPIRATION_TIME` env var set (e.g. `7d`)
- PostgreSQL with PostGIS extension enabled
- Redis running and accessible
- Cloudinary credentials set

---

_End of Audit Report_
