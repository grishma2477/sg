# Backend REST Test Suite

This folder contains a runnable REST Client suite for the mounted backend routes in this project.

Use it with the VS Code `REST Client` extension.

## Files

- `http-client.env.json`: credentials and base URL
- `00-bootstrap-auth.rest`: health check, rider/driver registration, all logins
- `01-rider-kyc.rest`: rider KYC submit + admin verify flow
- `02-driver-application.rest`: driver KYC + driver application + admin approval flow
- `03-ride-flows.rest`: payment method bootstrap, driver status/location, fixed-price ride flow, bidding flow, reviews
- `04-wallet-promo-gift.rest`: wallet, ride payments, promo codes, gift cards
- `05-admin-operations.rest`: admin user CRUD, payouts, admin ride CRUD, admin review CRUD
- `_fixtures/*.svg`: upload fixtures for multipart endpoints

## Run Order

1. Open `backend/rest/http-client.env.json` and adjust credentials if needed.
2. Run `00-bootstrap-auth.rest`.
3. Run `01-rider-kyc.rest`.
4. Run `02-driver-application.rest`.
5. Run `03-ride-flows.rest`.
6. Run `04-wallet-promo-gift.rest`.
7. Run `05-admin-operations.rest`.

## Important Notes

- Admin routes require an already seeded admin account. The default values here follow the old in-repo request samples: `admin@sg.com` / `driver123`.
- Rider and driver registration requests are included once in bootstrap. If those emails already exist, skip the register blocks and just run the login blocks.
- Several endpoints use `idempotency-key`. If you change the request body and replay the same request, change the key too.
- Multipart flows require working Cloudinary config on the backend.

## Code-Level Caveats Found During Analysis

- `GET /api/payments/methods` is likely shadowed by `GET /api/payments/:paymentId` because the dynamic route is declared first. This suite avoids that GET route.
- `/api/admin/payment-providers` is mounted without `verifyuser`, but its route file uses `requireRole`, which depends on `req.user`. That route group is effectively broken right now, so this suite uses `/api/payments/providers` instead.
- `/api/ride-requests/drivers/nearby` likely fails because `pool` is used in `driverLocationController.js` without being imported.
- `driverRoutes.js`, `driverProfileRoutes.js`, `adminBadgeRoutes.js`, and `safetyCommentRoutes.js` exist but are not mounted in `src/app.js`, so they are not included here.

## Response Paths Used

Most wrapped responses follow:

```json
{
  "success": true,
  "message": "SOMETHING",
  "data": {}
}
```

Auth login is a notable exception and returns fields like `token`, `userId`, `role`, and `driverId` at the top level.
