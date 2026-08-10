// k6 Performance & Load Testing for MyZubster Gateway
// Bounty #1104 — Performance Testing e Load Testing (500 MYZ)

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const benchmarkScore = new Trend('benchmark_score');
const requestsTotal = new Counter('requests_total');

// Configuration — 3 test profiles
const PROFILES = {
  smoke: { vus: 1, duration: '10s', threshold: 'p95<200' },
  load: { vus: 10, duration: '30s', stages: [
    { duration: '10s', target: 10 },
    { duration: '10s', target: 10 },
    { duration: '10s', target: 0 },
  ], threshold: 'p95<500' },
  stress: { vus: 50, duration: '30s', stages: [
    { duration: '10s', target: 25 },
    { duration: '10s', target: 50 },
    { duration: '10s', target: 0 },
  ], threshold: 'p95<1000' },
  soak: { vus: 20, duration: '60s', threshold: 'p95<800' },
};

const PROFILE = __ENV.TEST_PROFILE || 'load';
const config = PROFILES[PROFILE] || PROFILES.load;

export const options = {
  ...config,
  thresholds: {
    http_req_duration: [config.threshold],
    errors: ['rate<0.1'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// API endpoints to test
const ENDPOINTS = [
  { method: 'GET', path: '/api/health', name: 'Health Check' },
  { method: 'GET', path: '/api/status', name: 'Status' },
  { method: 'GET', path: '/api/token/balance', name: 'Token Balance' },
  { method: 'GET', path: '/api/market/stats', name: 'Market Stats' },
  { method: 'GET', path: '/api/payment/methods', name: 'Payment Methods' },
];

function runBenchmark(endpoint) {
  const start = Date.now();
  const res = http.request(endpoint.method, `${BASE_URL}${endpoint.path}`, null, {
    timeout: '10s',
  });
  const duration = Date.now() - start;
  
  apiLatency.add(duration);
  requestsTotal.add(1);
  
  const success = check(res, {
    [`${endpoint.name} status 2xx`]: (r) => r.status >= 200 && r.status < 300,
    [`${endpoint.name} response time < 2s`]: () => duration < 2000,
  });
  
  if (!success) {
    errorRate.add(1);
  }
  
  benchmarkScore.add(duration);
  sleep(0.5);
}

export default function () {
  group('API Benchmark Suite', () => {
    for (const endpoint of ENDPOINTS) {
      runBenchmark(endpoint);
    }
  });
  
  // Stress: concurrent requests
  group('Concurrent Load', () => {
    const responses = http.batch([
      ['GET', `${BASE_URL}/api/health`],
      ['GET', `${BASE_URL}/api/status`],
      ['GET', `${BASE_URL}/api/token/balance`],
    ]);
    responses.forEach((res, i) => {
      check(res, { [`batch ${i} ok`]: (r) => r.status === 200 });
    });
  });
}

export function handleSummary(data) {
  const summary = {
    profile: PROFILE,
    timestamp: new Date().toISOString(),
    base_url: BASE_URL,
    metrics: {
      total_requests: data.metrics.requests_total?.values?.count || 0,
      error_rate: data.metrics.errors?.values?.rate || 0,
      http_req_duration: data.metrics.http_req_duration?.values || {},
      api_latency: data.metrics.api_latency?.values || {},
    },
    thresholds: data.metrics.http_req_duration?.thresholds || {},
  };
  
  return {
    'stdout': JSON.stringify(summary, null, 2),
    'results/performance-summary.json': JSON.stringify(summary, null, 2),
    'results/performance-report.html': htmlReport(data),
  };
}
