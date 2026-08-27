import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const PROFILE = (__ENV.TEST_PROFILE || 'load').toLowerCase();

const profiles = {
  smoke: {
    vus: 1,
    duration: '10s',
  },
  load: {
    stages: [
      { duration: '15s', target: 5 },
      { duration: '30s', target: 10 },
      { duration: '15s', target: 0 },
    ],
  },
  stress: {
    stages: [
      { duration: '20s', target: 10 },
      { duration: '30s', target: 25 },
      { duration: '30s', target: 50 },
      { duration: '20s', target: 0 },
    ],
  },
  soak: {
    vus: 10,
    duration: '5m',
  },
};

const selectedProfile = profiles[PROFILE] || profiles.load;

// Keep this compatible with the k6 0.49 runtime pinned by the CI workflow.
// Its embedded JavaScript parser rejects object spread syntax here.
export const options = Object.assign({}, selectedProfile, {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    checks: ['rate>0.99'],
  },
});

export default function () {
  const response = http.get(`${BASE_URL}/api/health`, {
    tags: { endpoint: 'health' },
  });

  check(response, {
    'health returns 200': (r) => r.status === 200,
    'health responds with JSON': (r) => {
      const contentType = r.headers['Content-Type'] || r.headers['content-type'] || '';
      return contentType.includes('application/json');
    },
  });

  sleep(PROFILE === 'stress' ? 0.2 : 1);
}
