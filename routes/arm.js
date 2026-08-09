const express = require('express');
const router = express.Router();

// Mock state
let armState = {
    joints: { base: 0, shoulder: 0, elbow: 0, wrist: 0 },
    gripper: 'open',
    status: 'idle',
    calibrated: false
};

// [x] Endpoint POST /api/arm/move - Movimenti base
router.post('/move', (req, res) => {
    const { joints } = req.body;
    
    // [x] Safety features: limit joints to safe angles
    for (let key in joints) {
        if (joints[key] < -180 || joints[key] > 180) {
            return res.status(400).json({ error: 'Safety limit exceeded on ' + key });
        }
        armState.joints[key] = joints[key];
    }
    
    armState.status = 'moving';
    setTimeout(() => { armState.status = 'idle'; }, 500);
    
    res.json({ success: true, message: 'Arm moved safely', state: armState });
});

// [x] Endpoint POST /api/arm/grip - Presa
router.post('/grip', (req, res) => {
    const { action } = req.body; // 'open' or 'close'
    
    if (action !== 'open' && action !== 'close') {
        return res.status(400).json({ error: 'Invalid grip action' });
    }
    
    armState.gripper = action;
    res.json({ success: true, gripper: armState.gripper });
});

// [x] Endpoint GET /api/arm/status - Stato braccio
router.get('/status', (req, res) => {
    res.json(armState);
});

// [x] Calibrazione automatica
router.post('/calibrate', (req, res) => {
    armState.status = 'calibrating';
    armState.joints = { base: 0, shoulder: 0, elbow: 0, wrist: 0 };
    armState.calibrated = true;
    armState.status = 'idle';
    res.json({ success: true, message: 'Auto-calibration complete' });
});

module.exports = router;
