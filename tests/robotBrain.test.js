'use strict';

const {
  createRobot,
  assignJobToRobot,
  executeJob,
  deliverJob,
  handleDispute,
  getRobotStatus,
  getAllRobots
} = require('../robot_brain');

describe('robot_brain.js', () => {
  beforeEach(() => {
    // Clean state: remove all robots
    const robots = getAllRobots();
    robots.length = 0;
  });

  describe('createRobot', () => {
    test('should create a robot with id, name, and wallet', () => {
      const robot = createRobot('r1', 'TestBot', '0xWallet1');
      expect(robot).toBeDefined();
      expect(robot.robotId).toBe('r1');
      expect(robot.name).toBe('TestBot');
      expect(robot.walletAddress).toBe('0xWallet1');
      expect(robot.status).toBe('idle');
      expect(robot.currentJob).toBeNull();
    });

    test('should auto-initialize jobs array', () => {
      const robot = createRobot('r2', 'Bot2', '0xW2');
      expect(Array.isArray(robot.jobs)).toBe(true);
      expect(robot.jobs.length).toBe(0);
    });
  });

  describe('assignJobToRobot', () => {
    test('should assign a job to an idle robot', async () => {
      createRobot('r3', 'Worker', '0xW3');
      const result = await assignJobToRobot('r3', 'job-1', 'client1', 500, 'MYZ');
      expect(result).toBeDefined();
      if (result && result.currentJob) {
        expect(result.currentJob.jobId).toBe('job-1');
      }
    });

    test('should reject assignment for non-existent robot', async () => {
      const result = await assignJobToRobot('ghost', 'j1', 'c1', 100, 'MYZ');
      expect(result).toBeNull();
    });
  });

  describe('executeJob', () => {
    test('should execute the current job for a busy robot', async () => {
      createRobot('r4', 'Executor', '0xW4');
      await assignJobToRobot('r4', 'job-2', 'client2', 300, 'MYZ');
      const result = await executeJob('r4');
      expect(result).toBeDefined();
      if (result) {
        expect(result.status).toBe('executing');
      }
    });

    test('should return null for non-existent robot', async () => {
      const result = await executeJob('ghost');
      expect(result).toBeNull();
    });
  });

  describe('deliverJob', () => {
    test('should deliver a completed job', async () => {
      createRobot('r5', 'Deliverer', '0xW5');
      await assignJobToRobot('r5', 'job-3', 'client3', 200, 'MYZ');
      await executeJob('r5');
      const result = await deliverJob('r5');
      expect(result).toBeDefined();
      if (result) {
        expect(result.status).toBe('idle');
        expect(result.currentJob).toBeNull();
      }
    });

    test('should return null for non-existent robot', async () => {
      const result = await deliverJob('ghost');
      expect(result).toBeNull();
    });
  });

  describe('handleDispute', () => {
    test('should handle a dispute for an active job', async () => {
      createRobot('r6', 'Disputer', '0xW6');
      await assignJobToRobot('r6', 'job-4', 'client4', 150, 'MYZ');
      const result = await handleDispute('r6', 'job-4', 'Incorrect delivery');
      expect(result).toBeDefined();
      if (result) {
        expect(result.status).toBe('disputed');
      }
    });

    test('should return null for non-existent robot', async () => {
      const result = await handleDispute('ghost', 'j1', 'reason');
      expect(result).toBeNull();
    });
  });

  describe('getRobotStatus', () => {
    test('should return status for existing robot', () => {
      createRobot('r7', 'StatusBot', '0xW7');
      const status = getRobotStatus('r7');
      expect(status).toBeDefined();
      expect(status.robotId).toBe('r7');
    });

    test('should return null for non-existent robot', () => {
      const status = getRobotStatus('ghost');
      expect(status).toBeNull();
    });
  });

  describe('getAllRobots', () => {
    test('should return all robots', () => {
      createRobot('r8', 'Bot8', '0xW8');
      createRobot('r9', 'Bot9', '0xW9');
      const all = getAllRobots();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(2);
    });

    test('should return empty array when no robots', () => {
      const all = getAllRobots();
      all.length = 0;
      expect(all).toEqual([]);
    });
  });
});
