# MyZubster API Documentation

## Overview
MyZubster is a multi-service ecosystem running on chain ID 8888. This document provides interactive API documentation for all available endpoints.

## Base URLs
- **Main API**: 
- **RPC Endpoint**: 
- **MYZ Token Contract**: 

## Authentication
API endpoints are public. RPC endpoints follow standard Ethereum JSON-RPC conventions.

---

## Endpoints

### Health Check
```
GET /health
```
Returns service health status.

**Response (200)**:
```json
{
  "status": "ok",
  "timestamp": "2026-08-09T00:00:00Z",
  "services": {
    "api": "healthy",
    "rpc": "healthy"
  }
}
```

### Chain Information
```
POST /rpc
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "eth_chainId",
  "params": [],
  "id": 1
}
```
Returns the chain ID.

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x22b8"
}
```

### Block Number
```
POST /rpc
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}
```

### Token Balance
```
POST /rpc
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "eth_call",
  "params": [{
    "to": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "data": "0x70a08231000000000000000000000000{WALLET_ADDRESS}"
  }, "latest"],
  "id": 1
}
```

### Payout Information
```
GET /api/payout/balance?wallet={address}
```
Returns payout balance for a given wallet address.

**Response**:
```json
{
  "wallet": "0x...",
  "balance": "1000.00",
  "currency": "MYZ",
  "pending_payouts": []
}
```

### Pending Deliveries
```
GET /api/deliveries?wallet={address}
```
Returns pending deliveries for a wallet.

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request - Invalid parameters |
| 404  | Endpoint or resource not found |
| 500  | Internal Server Error |

## Rate Limiting
- Standard: 100 requests per minute per IP
- RPC: Standard Ethereum JSON-RPC rate limits apply

## SDK Examples

### JavaScript (ethers.js)
```javascript
const provider = new ethers.providers.JsonRpcProvider('https://api.myzubster.com/rpc');
const chainId = await provider.getNetwork();
console.log('Chain ID:', chainId.chainId); // 8888
```

### Python (web3.py)
```python
from web3 import Web3
w3 = Web3(Web3.HTTPProvider('https://api.myzubster.com/rpc'))
print('Chain ID:', w3.eth.chain_id)  # 8888
```

### cURL
```bash
# Health check
curl https://api.myzubster.com/health

# Get block number
curl -X POST https://api.myzubster.com/rpc   -H "Content-Type: application/json"   -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

*Last updated: August 2026*
