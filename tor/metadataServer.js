'use strict';

const http = require('http');
const { loadRegistry } = require('../services/torInstanceRegistry');

const configPath = process.env.TOR_INSTANCES_CONFIG || '/run/myzubster-tor/instances.json';
const host = process.env.TOR_METADATA_HOST || '127.0.0.1';
const port = Number(process.env.TOR_METADATA_PORT || 9080);

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(`${JSON.stringify(body)}\n`);
}

function createMetadataServer(registry) {
  return http.createServer((request, response) => {
    if (request.method !== 'GET') {
      return sendJson(response, 405, { error: 'method_not_allowed' });
    }
    if (request.url === '/healthz') {
      return sendJson(response, 200, { status: 'ok', torEnabled: registry.enabled });
    }
    if (request.url === '/v1/tor/instances') {
      return sendJson(response, 200, registry.snapshot());
    }
    return sendJson(response, 404, { error: 'not_found' });
  });
}

if (require.main === module) {
  const registry = loadRegistry(configPath);
  createMetadataServer(registry).listen(port, host, () => {
    console.log(`Tor metadata listening on ${host}:${port}`);
  });
}

module.exports = { createMetadataServer };
