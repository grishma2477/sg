# SG (Sawa Gaadi) — Go Live Checklist
_Complete every item before flipping traffic to production._

---

## 1. Infrastructure

- [ ] **Server provisioned** — Ubuntu 22.04 LTS, min 2 vCPU / 4 GB RAM (DigitalOcean / AWS / Hetzner)
- [ ] **Domain configured** — `sawagaadi.com` A record → server IP; `api.sawagaadi.com` → same
- [ ] **SSL certificate active**
  ```bash
  sudo certbot --nginx -d sawagaadi.com -d api.sawagaadi.com
  # Verify auto-renewal:
  sudo certbot renew --dry-run
  ```
- [ ] **Firewall rules** — ports 22 (SSH), 80 (HTTP→HTTPS redirect), 443 (HTTPS) only
  ```bash
  sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable
  ```
- [ ] **SSH key auth only** — password auth disabled in `/etc/ssh/sshd_config`

---

## 2. Database

- [ ] **PostgreSQL 16 + PostGIS 3 installed and running**
  ```bash
  psql -c "SELECT PostGIS_Version();"
  ```
- [ ] **All migrations applied** — run in order sprint0 → sprint12
  ```bash
  cd backend && node scripts/migrate.js
  ```
- [ ] **pg_stat_statements enabled** (Sprint 12 migration)
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements';
  ```
- [ ] **Backup ran successfully at least once**
  ```bash
  DATABASE_URL=$DATABASE_URL BACKUP_DIR=/backups ./backend/scripts/backup-db.sh
  ls -lh /backups/*.sql.gz
  ```
- [ ] **Cron job for daily backup**
  ```cron
  0 2 * * * DATABASE_URL=... BACKUP_DIR=/backups /opt/sg/backend/scripts/backup-db.sh >> /var/log/sg-backup.log 2>&1
  ```
- [ ] **Connection pool tuned** — `max: 20` in `DBConnection.js` matches `max_connections` in postgres.conf

---

## 3. Redis

- [ ] **Redis 7 running** — `redis-cli ping` returns `PONG`
- [ ] **Redis bind to localhost only** — not exposed publicly
- [ ] **`REDIS_URL` env var set** in `.env`

---

## 4. Environment Variables

- [ ] **All required vars set** — run env check:
  ```bash
  cd backend && NODE_ENV=production node -e "import('./src/server.js')" 2>&1 | head -5
  ```
- [ ] **Secrets rotated from development values** — JWT secrets, DB password, Cloudinary, etc.
- [ ] **`ALLOWED_ORIGINS`** set to `https://sawagaadi.com` (no trailing slash)
- [ ] **`FRONTEND_URL`** set to `https://sawagaadi.com`

### Required `.env` variables checklist:
```
ACCESS_TOKEN_SECRET_KEY      ✓ / ✗
REFRESH_TOKEN_SECRET_KEY     ✓ / ✗
DATABASE_URL                 ✓ / ✗
REDIS_URL                    ✓ / ✗
SENTRY_DSN                   ✓ / ✗
FRONTEND_URL                 ✓ / ✗
ALLOWED_ORIGINS              ✓ / ✗
SMTP_HOST                    ✓ / ✗
SMTP_USER                    ✓ / ✗
SMTP_PASS                    ✓ / ✗
ADMIN_EMAIL                  ✓ / ✗
GOOGLE_MAPS_API_KEY          ✓ / ✗
CLOUDINARY_CLOUD_NAME        ✓ / ✗
CLOUDINARY_API_KEY           ✓ / ✗
CLOUDINARY_API_SECRET        ✓ / ✗
ESEWA_SECRET_KEY             ✓ / ✗
KHALTI_SECRET_KEY            ✓ / ✗
SPARROW_SMS_TOKEN            ✓ / ✗
FIREBASE_PROJECT_ID          ✓ / ✗
```

---

## 5. Third-Party Services

- [ ] **Google Maps API key** — restricted to `api.sawagaadi.com` in Google Cloud Console; Directions, Places, Geocoding, Distance Matrix APIs enabled
- [ ] **Firebase** — `google-services.json` (Android) + `GoogleService-Info.plist` (iOS) in `mobile/` and committed to EAS secrets (not repo)
- [ ] **FCM push sending works** — send a test notification from Firebase Console
- [ ] **eSewa merchant account approved** for live transactions
- [ ] **Khalti merchant account approved** for live transactions
- [ ] **Cloudinary** — production environment configured, upload preset set to signed
- [ ] **Sparrow SMS** — production API token active, sender ID approved by NTC/Ncell

---

## 6. Monitoring

- [ ] **Sentry receiving events**
  ```bash
  # Trigger a test error:
  curl -X POST https://api.sawagaadi.com/api/debug/sentry-test -H "Authorization: Bearer ADMIN_TOKEN"
  # Check Sentry dashboard for the event
  ```
- [ ] **UptimeRobot monitor created** — `GET https://api.sawagaadi.com/health` every 5 minutes; alert to `admin@sawagaadi.com`
- [ ] **Log rotation configured** — `logs/` directory has max 14d retention set in `logger.js`
- [ ] **PM2 startup script** — survives server reboot
  ```bash
  pm2 start backend/ecosystem.config.js
  pm2 save
  pm2 startup
  # Run the printed command as root
  ```

---

## 7. Nginx

- [ ] **Config test passes**: `sudo nginx -t`
- [ ] **HTTPS redirect working**: `curl -I http://sawagaadi.com` → 301
- [ ] **WebSocket proxying works** — test Socket.io connection from mobile app
- [ ] **Security headers present** — check with [securityheaders.com](https://securityheaders.com)

---

## 8. CI/CD

- [ ] **GitHub Actions CI passes** on `master` branch (all tests green)
- [ ] **Deploy workflow** — push to `master` triggers deploy; verify `deploy.yml` SSH secrets are set in GitHub repo settings:
  - `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`, `SSH_PORT`

---

## 9. Mobile Apps

- [ ] **iOS build** — `eas build --platform ios --profile production` completes without error
- [ ] **Android build** — `eas build --platform android --profile production` completes without error
- [ ] **`.env` values baked in** — `EXPO_PUBLIC_API_URL` points to `https://api.sawagaadi.com`
- [ ] **Both apps submitted for review** — App Store Connect + Google Play Console
- [ ] **App Store Review Notes** — `mobile/store-assets/review-notes.md` attached to submission

---

## 10. Load Testing

Run before going live. Target: 300 req/s, p95 < 200ms.

```bash
# Install k6
winget install k6  # Windows
# brew install k6  # macOS

# Run all three scenarios:
k6 run --env BASE_URL=https://api.sawagaadi.com --env RIDER_TOKEN=... backend/tests/load/k6-ride-request.js
k6 run --env BASE_URL=https://api.sawagaadi.com --env DRIVER_TOKEN=... backend/tests/load/k6-driver-location.js
k6 run --env BASE_URL=https://api.sawagaadi.com --env RIDER_TOKEN=... backend/tests/load/k6-wallet.js
```

- [ ] All three tests pass with p95 < 200ms and error rate < 1%
- [ ] No Sentry errors spike during load test

---

## 11. E2E QA Sign-off

Test on real devices (iOS + Android) connected to **production** environment:

| Scenario | iOS | Android |
|----------|-----|---------|
| Rider OTP login → home → request ride → accept bid → complete → review | ☐ | ☐ |
| Driver OTP login → go online → receive request → accept → navigate → complete | ☐ | ☐ |
| eSewa top-up → wallet balance updated | ☐ | ☐ |
| Khalti top-up → wallet balance updated | ☐ | ☐ |
| KYC upload → admin approves → driver unblocked | ☐ | ☐ |
| Multi-stop ride (2 stops) | ☐ | ☐ |
| Ride cancel within 2 min (free) | ☐ | ☐ |
| Ride cancel after 2 min (NPR 50 fee charged) | ☐ | ☐ |
| Promo code applied → fare reduced | ☐ | ☐ |
| Safety concern filed ≤ 3 stars → admin email received | ☐ | ☐ |
| Network drop during active ride → reconnects, shows correct state | ☐ | ☐ |
| Kill app during ride → reopen → correct ride state restored | ☐ | ☐ |
| Background 5+ min → reopen → socket reconnects, live map works | ☐ | ☐ |
| Driver payout request → admin approves → driver notified | ☐ | ☐ |
| Surge zone active → rider sees ⚡ banner on vehicle select | ☐ | ☐ |

---

## 12. Support

- [ ] **Support email active** — `help@sawagaadi.com` forwarding to team inbox
- [ ] **WhatsApp Business number** set up for user issue reports
- [ ] **On-call rotation** defined for first 2 weeks post-launch
- [ ] **Rollback plan ready** — `pm2 reload sg-api --update-env` or Docker image rollback

---

_Sign-off: All items checked by _________________ on _________ before DNS cutover._
