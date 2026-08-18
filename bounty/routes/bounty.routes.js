'use strict';

const express = require('express');
const { BountyController } = require('../controllers/bounty.controller');

function getDefaultAuthenticate() {
    return (req, res, next) => {
        const { authenticate } = require('../../middleware/auth.middleware');
        return authenticate(req, res, next);
    };
}

function getDefaultAuthorize() {
    return (...roles) => (req, res, next) => {
        const { authorize } = require('../../middleware/auth.middleware');
        return authorize(...roles)(req, res, next);
    };
}

function createBountyRouter(options = {}) {
    const router = express.Router();

    const Controller = options.BountyController || BountyController;

    const authenticate =
        options.authenticate || getDefaultAuthenticate();

    const authorize =
        options.authorize || getDefaultAuthorize();

    const bountyController =
        options.bountyController || new Controller();

    // All bounty routes require authentication.
    router.use(authenticate);

    // Read routes
    router.get('/', (req, res) => bountyController.getBounties(req, res));
    router.get('/stats', (req, res) => bountyController.getBountyStats(req, res));
    router.get('/:id', (req, res) => bountyController.getBounty(req, res));

    // Bounty management
    router.post(
        '/',
        authorize('admin', 'bounty_manager'),
        (req, res) => bountyController.createBounty(req, res)
    );

    router.put(
        '/:id/assign',
        authorize('admin', 'bounty_manager'),
        (req, res) => bountyController.assignBounty(req, res)
    );

    router.put(
        '/:id/status',
        (req, res) => bountyController.updateBountyStatus(req, res)
    );

    router.post(
        '/:id/comments',
        (req, res) => bountyController.addComment(req, res)
    );

    // Payment routes - explicitly admin-only.
    router.post(
        '/:id/payment',
        authorize('admin'),
        (req, res) => bountyController.requestPayment(req, res)
    );

    router.post(
        '/:id/payment/confirm',
        authorize('admin'),
        (req, res) => bountyController.confirmPayment(req, res)
    );
    router.post(
    '/:id/payment/fail',
    authorize('admin'),
    (req, res) => bountyController.failPayment(req, res)
);

router.post(
    '/:id/payment/retry',
    authorize('admin'),
    (req, res) => bountyController.retryPayment(req, res)
);

    return router;
}

// Preserve the existing production export.
const router = createBountyRouter();

module.exports = router;
module.exports.createBountyRouter = createBountyRouter;