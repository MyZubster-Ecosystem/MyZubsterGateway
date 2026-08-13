/**
 * Tests for gateway/xmr_wallet.js — Monero (XMR) Wallet Integration
 * Bounty B5 / #238 — 150 MYZ
 */

const { lockXMR, releaseXMR, refundXMR, healthCheck } = require('../gateway/xmr_wallet');

jest.mock('http');
jest.mock('https');

const http = require('http');

describe('Monero Wallet (xmr_wallet.js)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('lockXMR', () => {
    it('should reject if amount is zero or negative', async () => {
      await expect(lockXMR(0)).rejects.toThrow('amount must be positive');
      await expect(lockXMR(-5)).rejects.toThrow('amount must be positive');
    });

    it('should create escrow sub-address and transfer funds', async () => {
      let callCount = 0;
      http.request.mockImplementation((opts, cb) => {
        callCount++;
        const res = {
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              if (callCount === 1) {
                handler(JSON.stringify({ result: { address: 'escrow_xmr_addr', address_index: 5 } }));
              } else {
                handler(JSON.stringify({
                  result: {
                    tx_hash: 'xmr_tx_lock',
                    amount: 100000000000000,
                    fee: 20000000000
                  }
                }));
              }
            }
            if (event === 'end') handler();
          })
        };
        cb(res);
        return { on: jest.fn(), write: jest.fn(), end: jest.fn() };
      });

      const result = await lockXMR(1.0, 0, 'Test XMR lock');
      expect(result.txid).toBe('xmr_tx_lock');
      expect(result.address).toBe('escrow_xmr_addr');
      expect(result.amount).toBe(0.1);
      expect(result.fee).toBe(0.00002);
    });

    it('should handle RPC failure', async () => {
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
      await expect(lockXMR(1.0)).rejects.toThrow('Monero RPC connection failed');
    });
  });

  describe('releaseXMR', () => {
    it('should reject if addresses missing', async () => {
      await expect(releaseXMR(null, 'addr')).rejects.toThrow('fromAddress and toAddress required');
    });

    it('should release funds with balance check', async () => {
      let callCount = 0;
      http.request.mockImplementation((opts, cb) => {
        callCount++;
        const res = {
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              if (callCount === 1) {
                handler(JSON.stringify({ result: { unlocked_balance: 5000000000000 } }));
              } else {
                handler(JSON.stringify({
                  result: { tx_hash: 'xmr_rel', amount: 5000000000000, fee: 10000000000 }
                }));
              }
            }
            if (event === 'end') handler();
          })
        };
        cb(res);
        return { on: jest.fn(), write: jest.fn(), end: jest.fn() };
      });

      const result = await releaseXMR('escrow_xmr', 'robot_xmr');
      expect(result.txid).toBe('xmr_rel');
    });
  });

  describe('refundXMR', () => {
    it('should reject on missing params', async () => {
      await expect(refundXMR(null, 'addr', 1)).rejects.toThrow();
      await expect(refundXMR('addr', 'addr2', 0)).rejects.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return ok=true on success', async () => {
      http.request.mockImplementation((opts, cb) => {
        const res = {
          on: jest.fn((event, handler) => {
            if (event === 'data') handler(JSON.stringify({ result: { version: 'v0.18.3.1' } }));
            if (event === 'end') handler();
          })
        };
        cb(res);
        return { on: jest.fn(), write: jest.fn(), end: jest.fn() };
      });
      const result = await healthCheck();
      expect(result.ok).toBe(true);
      expect(result.version).toBe('v0.18.3.1');
    });
  });
});
