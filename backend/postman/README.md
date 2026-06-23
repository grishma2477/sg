# Postman Exports

This folder contains Postman JSON exports for the backend API.

## Files

- `01-Auth-Kyc-Driver-Application.postman_collection.json`
  Auth, KYC, and driver application flows.
- `02-Ride-Flows.postman_collection.json`
  Ride request, ride lifecycle, bidding, driver status, and review flows.
- `03-Wallet-Promo-Gift.postman_collection.json`
  Payments, wallet, ride payments, promo codes, and gift cards.
- `04-Admin-Operations.postman_collection.json`
  Admin users, payouts, admin rides, and admin reviews.
- `99-Unmounted-Or-Broken.postman_collection.json`
  Route groups that exist in code but are not mounted, or are currently broken because of backend code issues.
- `SG-Backend-Local.postman_environment.json`
  Local environment variables for base URL, credentials, tokens, and generated IDs.

## Import Order

1. Import `SG-Backend-Local.postman_environment.json`
2. Import `01-Auth-Kyc-Driver-Application.postman_collection.json`
3. Import `02-Ride-Flows.postman_collection.json`
4. Import `03-Wallet-Promo-Gift.postman_collection.json`
5. Import `04-Admin-Operations.postman_collection.json`
6. Import `99-Unmounted-Or-Broken.postman_collection.json`
7. Select the imported local environment in Postman

## Notes

- Login requests save tokens and IDs into the environment automatically.
- Some create requests also save generated IDs into the environment.
- Multipart requests use fixture files from this repo. If Postman cannot resolve the file path on your machine, update the file path in the request body after import.
- `99-Unmounted-Or-Broken` intentionally stays separate so unreachable or known-bad endpoints do not interfere with the normal happy-path collections.
