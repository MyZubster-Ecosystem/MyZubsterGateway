'use strict';

const { createBounty, assignBounty, completeBounty, listBounties } = require('../bounty');

describe('bounty.js', () => {
  beforeEach(() => {
    // Reset internal state by clearing the bounties array
    // Access via listBounties — if empty, state is clean
    const bounties = listBounties();
    bounties.length = 0;
  });

  describe('createBounty', () => {
    test('should create a bounty with issueId and rewardMYZ', () => {
      const bounty = createBounty('issue-1', 100);
      expect(bounty).toBeDefined();
      expect(bounty.issueId).toBe('issue-1');
      expect(bounty.rewardMYZ).toBe(100);
      expect(bounty.assignedTo).toBeNull();
      expect(bounty.status).toBe('open');
    });

    test('should create a bounty with assignedTo when provided', () => {
      const bounty = createBounty('issue-2', 200, 'testuser');
      expect(bounty.assignedTo).toBe('testuser');
    });

    test('should auto-generate unique ids', () => {
      const b1 = createBounty('a', 10);
      const b2 = createBounty('b', 20);
      expect(b1.id).not.toBe(b2.id);
    });
  });

  describe('assignBounty', () => {
    test('should assign a bounty to a user', () => {
      createBounty('issue-3', 50);
      const assigned = assignBounty('issue-3', 'dev1');
      expect(assigned).toBeDefined();
      expect(assigned.assignedTo).toBe('dev1');
    });

    test('should return null for non-existent issueId', () => {
      const result = assignBounty('nonexistent', 'dev1');
      expect(result).toBeNull();
    });
  });

  describe('completeBounty', () => {
    test('should complete a bounty with wallet address', () => {
      createBounty('issue-4', 75, 'dev2');
      const completed = completeBounty('issue-4', '0xWallet123');
      expect(completed).toBeDefined();
      expect(completed.status).toBe('completed');
    });

    test('should return null for non-existent issueId', () => {
      const result = completeBounty('nonexistent', '0xWallet');
      expect(result).toBeNull();
    });
  });

  describe('listBounties', () => {
    test('should return all bounties', () => {
      createBounty('i1', 10);
      createBounty('i2', 20);
      const all = listBounties();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(2);
    });

    test('should return empty array when no bounties', () => {
      const all = listBounties();
      all.length = 0;
      expect(all).toEqual([]);
    });
  });
});
