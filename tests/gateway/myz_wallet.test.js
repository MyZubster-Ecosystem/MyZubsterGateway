/**
 * Tests for gateway/myz_wallet.js — Tari (MYZ) Wallet Integration
 * Bounty B4 / #237 — 150 MYZ
 */

const { lockMYZ, releaseMYZ, refundMYZ, healthCheck } = require('../gateway/myz_wallet');

// Mock HTTP module
jest.mock('http');
jest.mock('https');

const http = require('http');
const https = require('https');

function mockRpcResponse(result, error = null) {
  return {
    on: jest.fn(),
    write: jest.fn(),
    end: jest.fn()
  };
}

describe('Tari Wallet (myz_wallet.js)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('lockMYZ', () => {
    it('should reject if amount is zero or negative', async () => {
      await expect(lockMYZ(0)).rejects.toThrow('amount must be positive');
      await expect(lockMYZ(-10)).rejects.toThrow('amount must be positive');
    });

    it('should generate escrow address and transfer funds', async () => {
      const mockRequest = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      };

      let callCount = 0;
      http.request.mockImplementation((opts, cb) => {
        callCount++;
        const res = {
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              if (callCount === 1) {
                handler(JSON.stringify({
                  result: { address: 'escrow_addr_123', label: 'escrow-1' }
                }));
              } else if (callCount === 2) {
                handler(JSON.stringify({
                  result: { fee: 2 }
                }));
              } else {
                handler(JSON.stringify({
                  result: { transaction_id: 'tx_abc123' }
                }));
              }
            }
            if (event === 'end') handler();
          })
        };
        cb(res);
        return mockRequest;
      });

      const result = await lockMYZ(100, 'wallet_1', 'Test lock');
      expect(result.txid).toBe('tx_abc123');
      expect(result.address).toBe('escrow_addr_123');
      expect(result.amount).toBe(100);
    });

    it('should handle RPC connection failure gracefully', async () => {
      http.request.mockImplementation((opts, cb) => {
        const req = {
          on: jest.fn((event, handler) => {
            if (event === 'error') handler(new Error('ECONNREFUSED'));
          }),
          write: jest.fn(),
          end: jest.fn()
        };
        return req;
      });

      await expect(lockMYZ(50)).rejects.toThrow('Tari RPC connection failed');
    });
  });

  describe('releaseMYZ', () => {
    it('should reject if addresses are missing', async () => {
      await expect(releaseMYZ(null, 'addr')).rejects.toThrow('fromAddress and toAddress required');
      await expect(releaseMYZ('addr', null)).rejects.toThrow('fromAddress and toAddress required');
    });

    it('should release funds to destination', async () => {
      let callCount = 0;
      http.request.mockImplementation((opts, cb) => {
        callCount++;
        const res = {
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              if (callCount === 1) {
                handler(JSON.stringify({ result: { available_balance: 500 } }));
              } else {
                handler(JSON.stringify({ result: { transaction_id: 'tx_release' } }));
              }
            }
            if (event === 'end') handler();
          })
        };
        cb(res);
        return { on: jest.fn(), write: jest.fn(), end: jest.fn() };
      });

      const result = await releaseMYZ('escrow_1', 'robot_1');
      expect(result.txid).toBe('tx_release');
      expect(result.amount).toBe(500);
    });
  });

  describe('refundMYZ', () => {
    it('should reject if parameters are missing', async () => {
      await expect(refundMYZ(null, 'addr', 10)).rejects.toThrow();
      await expect(refundMYZ('addr', null, 10)).rejects.toThrow();
      await expect(refundMYZ('addr', 'addr2', 0)).rejects.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return ok=true when RPC is reachable', async () => {
      http.request.mockImplementation((opts, cb) => {
        const res = {
          on: jest.fn((event, handler) => {
            if (event === 'data') handler(JSON.stringify({ result: { network: 'tari', version: '1.0' } }));
            if (event === 'end') handler();
          })
        };
        cb(res);
        return { on: jest.fn(), write: jest.fn(), end: jest.fn() };
      });

      const result = await healthCheck();
      expect(result.ok).toBe(true);
      expect(result.network).toBe('tari');
    });

    it('should return ok=false when RPC is down', async () => {
      http.request.mockImplementation((opts, cb) => {
        const req = {
          on: jest.fn((event, handler) => {
            if (event === 'error') handler(new Error('ECONNREFUSED'));
          }),
          write: jest.fn(),
          end: jest.fn()
        };
        return req;
      });

      const result = await healthCheck();
      expect(result.ok).toBe(false);
      expect(result.error).toContain('connection failed');
    });
  });
});
