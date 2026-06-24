/**
 * k6 Load Test — Ride Request Flow
 * Run: k6 run --env BASE_URL=http://localhost:5000 backend/tests/load/k6-ride-request.js
 *
 * Scenario: 100 concurrent riders request fare estimate then create a ride request.
 * Target: p95 < 200ms, error rate < 1%
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate   = new Rate('errors');
const estimateTrend = new Trend('estimate_duration_ms', true);
const createTrend   = new Trend('create_duration_ms', true);

export const options = {
  stages: [
    { duration: '30s', target: 20  }, // ramp up
    { duration: '1m',  target: 100 }, // hold at 100 VUs
    { duration: '30s', target: 0   }, // ramp down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(95)<200'],
    errors:            ['rate<0.01'],
  },
};

const BASE_URL  = __ENV.BASE_URL || 'http://localhost:5000';
const TOKEN     = __ENV.RIDER_TOKEN || 'PASTE_RIDER_TOKEN';

const PICKUPS = [
  { lat: 27.7154, lng: 85.3123 }, // Thamel
  { lat: 27.7006, lng: 85.3139 }, // New Road
  { lat: 27.7215, lng: 85.3186 }, // Lazimpat
  { lat: 27.6807, lng: 85.3468 }, // Koteshwor
];
const DROPOFFS = [
  { lat: 27.6588, lng: 85.3247 }, // Patan
  { lat: 27.6939, lng: 85.2823 }, // Kalanki
  { lat: 27.7333, lng: 85.3281 }, // Maharajgunj
  { lat: 27.6722, lng: 85.4277 }, // Bhaktapur
];

export default function () {
  const pickup  = PICKUPS[Math.floor(Math.random() * PICKUPS.length)];
  const dropoff = DROPOFFS[Math.floor(Math.random() * DROPOFFS.length)];
  const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

  // Step 1: Fare estimate
  const estRes = http.get(
    `${BASE_URL}/api/ride-requests/estimate?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&dropoff_lat=${dropoff.lat}&dropoff_lng=${dropoff.lng}`,
    { headers }
  );
  estimateTrend.add(estRes.timings.duration);
  const estOk = check(estRes, {
    'estimate 200':           r => r.status === 200,
    'estimate has estimates': r => JSON.parse(r.body)?.data?.estimates?.length > 0,
  });
  errorRate.add(!estOk);

  sleep(0.5);

  // Step 2: Create ride request
  const body = JSON.stringify({
    pickupLocation:  { type: 'Point', coordinates: [pickup.lng, pickup.lat] },
    pickupAddress:   'Test Pickup',
    dropoffLocation: { type: 'Point', coordinates: [dropoff.lng, dropoff.lat] },
    dropoffAddress:  'Test Dropoff',
    vehiclePreference: 'bike',
    pricingMode:     'bidding',
    stops:           [],
    passengerCount:  1,
  });
  const createRes = http.post(`${BASE_URL}/api/ride-requests`, body, { headers });
  createTrend.add(createRes.timings.duration);
  const createOk = check(createRes, {
    'create 201 or 200': r => r.status === 201 || r.status === 200,
    'create has id':     r => JSON.parse(r.body)?.data?.id != null,
  });
  errorRate.add(!createOk);

  sleep(1);
}
