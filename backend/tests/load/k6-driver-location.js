/**
 * k6 Load Test — Driver Location Update
 * Run: k6 run --env BASE_URL=http://localhost:5000 backend/tests/load/k6-driver-location.js
 *
 * Scenario: 50 concurrent drivers update their GPS every 5 seconds.
 * Target: p95 < 100ms (location updates must be fast)
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate    = new Rate('errors');
const updateTrend  = new Trend('location_update_ms', true);

export const options = {
  stages: [
    { duration: '20s', target: 50 }, // ramp up
    { duration: '2m',  target: 50 }, // hold — simulate 50 active drivers
    { duration: '10s', target: 0  }, // ramp down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(95)<100'],
    errors:            ['rate<0.01'],
  },
};

const BASE_URL     = __ENV.BASE_URL    || 'http://localhost:5000';
const DRIVER_TOKEN = __ENV.DRIVER_TOKEN || 'PASTE_DRIVER_TOKEN';

// Kathmandu bounding box — random coords within city
function randCoord(base, spread) {
  return base + (Math.random() - 0.5) * spread;
}

export default function () {
  const lat = randCoord(27.7172, 0.06);
  const lng = randCoord(85.3240, 0.08);

  const res = http.post(
    `${BASE_URL}/api/drivers/location`,
    JSON.stringify({ lat, lng, is_online: true }),
    {
      headers: {
        Authorization: `Bearer ${DRIVER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  updateTrend.add(res.timings.duration);
  const ok = check(res, {
    'location update 200': r => r.status === 200,
  });
  errorRate.add(!ok);

  sleep(5); // drivers update every 5s
}
