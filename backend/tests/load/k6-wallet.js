/**
 * k6 Load Test — Wallet Balance & History
 * Run: k6 run --env BASE_URL=http://localhost:5000 backend/tests/load/k6-wallet.js
 *
 * Scenario: 200 concurrent users checking wallet balance (most common app action).
 * Target: p95 < 80ms (simple SELECT — must be fast)
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate   = new Rate('errors');
const balanceTrend  = new Trend('balance_ms', true);
const historyTrend  = new Trend('history_ms', true);

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m',  target: 200 },
    { duration: '30s', target: 0   },
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(95)<80'],
    errors:            ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL   || 'http://localhost:5000';
const TOKEN    = __ENV.RIDER_TOKEN || 'PASTE_RIDER_TOKEN';

export default function () {
  const headers = { Authorization: `Bearer ${TOKEN}` };

  // Check balance
  const balRes = http.get(`${BASE_URL}/api/wallet/balance`, { headers });
  balanceTrend.add(balRes.timings.duration);
  const balOk = check(balRes, {
    'balance 200':       r => r.status === 200,
    'balance has data':  r => JSON.parse(r.body)?.data != null,
  });
  errorRate.add(!balOk);

  sleep(0.2);

  // Check history
  const histRes = http.get(`${BASE_URL}/api/wallet/transactions?limit=10`, { headers });
  historyTrend.add(histRes.timings.duration);
  const histOk = check(histRes, {
    'history 200': r => r.status === 200,
  });
  errorRate.add(!histOk);

  sleep(2);
}
