# App Review Notes — SG (Sawa Gaadi)

## For Apple App Store Review

### Test Credentials

**Rider account:**
- Phone: +977-9800000001
- OTP: 123456 (test bypass)
- Name: Test Rider

**Driver account:**
- Phone: +977-9800000002
- OTP: 123456 (test bypass)
- Name: Test Driver
- Vehicle: Bike · NP-1001 (pre-approved KYC)

### Review Walkthrough

1. Launch app → tap "Continue as Rider" → enter +977-9800000001 → OTP 123456
2. Tap "Set Destination" → search "Thamel" → select top result
3. Select Bike → review fare estimate → tap "Request Ride"
4. The driver account will auto-bid (run driver login in another device/simulator)
5. Accept the bid → watch live map tracking
6. Complete ride → rate driver

### Location Usage Explanation

- **Foreground location** (When In Use): Used for riders to see their own position, display nearby driver pins, and track driver during active ride.
- **Background location** (Always): Used **only when the user is a driver** and has toggled "Go Online." An Android foreground service notification appears. The driver can stop sharing at any time by going offline. No background location is requested for rider accounts.

### Background Refresh Explanation

`fetch` background mode is used for refreshing push notification state when the app is woken by the system. No significant CPU or battery work is done.

### Push Notifications Explanation

Used exclusively for ride-related alerts: new bid received, bid accepted/rejected, driver arriving, ride started, ride completed, wallet transaction. No marketing notifications are sent.

### Camera / Photo Library

Used only in the KYC document upload screen (Profile → Verify Identity). Accessed only when user explicitly taps "Upload Document" and grants permission in-session.

---

## For Google Play Review

### Test Credentials
(Same as above)

### Safety Data Disclosure

Per Google Play's Data Safety form:

| Data type | Collected | Shared | Purpose |
|---|---|---|---|
| Phone number | Yes | No (SMS OTP only via Sparrow SMS / Twilio) | Account login |
| Precise location | Yes | Yes (driver location → riders during active ride) | Core ride functionality |
| Name | Yes | Yes (shown to matched driver/rider) | Core ride functionality |
| Financial transactions | Yes | No | Wallet + earnings |
| Photos | Yes | No (uploaded to Cloudinary for KYC) | Identity verification |
| Device identifiers | Yes | No | Push notifications |

All data transmission uses TLS 1.3. Users can delete their account from Settings → Delete Account.

### App Access Notes

- SMS OTP is sent to the test numbers listed above. Alternatively, in the test/dev build, the OTP is displayed on screen for easy review.
- The bidding flow requires two devices (or two simulators). The review team may test the rider-side flow only — the driver accepts the bid automatically after 10 seconds in the test environment.
