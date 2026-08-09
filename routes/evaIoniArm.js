const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory state of EVA IONI robots
const robots = {};

/**
 * 1. Register a new EVA IONI arm
 */
router.post('/register', (req, res) => {
    const { serialNumber, model } = req.body;
    
    if (!serialNumber) {
        return res.status(400).json({ error: 'serialNumber is required' });
    }

    const robotId = crypto.randomUUID();
    
    robots[robotId] = {
        robotId,
        serialNumber,
        model: model || 'EVA IONI - 4 DOF',
        status: 'online',
        joints: {
            base: 0,
            shoulder: 0,
            elbow: 0,
            wrist: 0
        },
        gripper: 'open',
        pressure: 0, // Pressure sensor data for seed planting
        lastPing: new Date().toISOString()
    };

    res.json({
        success: true,
        message: 'EVA IONI Arm registered successfully',
        robotId
    });
});

/**
 * 2. Send commands to the robotic arm (e.g. Move, Plant Seed)
 */
router.post('/:id/command', (req, res) => {
    const { id } = req.params;
    const { command, parameters } = req.body;
    
    const robot = robots[id];
    if (!robot) {
        return res.status(404).json({ error: 'Robot not found' });
    }

    if (command === 'MOVE') {
        robot.joints = { ...robot.joints, ...parameters.joints };
    } else if (command === 'GRIPPER') {
        robot.gripper = parameters.state; // 'open' or 'close'
        robot.pressure = parameters.state === 'close' ? 45.5 : 0.0;
    } else if (command === 'PLANT_SEED') {
        // Automation sequence for planting a seed
        robot.gripper = 'close';
        robot.pressure = 50.0;
        robot.joints.wrist = -90; // Move down
        robot.gripper = 'open'; // Release seed
        robot.pressure = 0.0;
        robot.joints.wrist = 0; // Move up
    } else {
        return res.status(400).json({ error: 'Unknown command' });
    }

    robot.lastPing = new Date().toISOString();

    res.json({
        success: true,
        command,
        robotState: robot
    });
});

/**
 * 3. Monitor Robot Status
 */
router.get('/:id/status', (req, res) => {
    const { id } = req.params;
    const robot = robots[id];
    
    if (!robot) {
        return res.status(404).json({ error: 'Robot not found' });
    }

    res.json({
        robotId: id,
        status: robot.status,
        joints: robot.joints,
        gripper: robot.gripper,
        pressure: robot.pressure,
        lastPing: robot.lastPing
    });
});

module.exports = router;
