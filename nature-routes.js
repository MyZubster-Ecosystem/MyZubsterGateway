const express = require('express');
const router = express.Router();
const { NatureTokenization } = require('../nature/nature-tokenization');

let instance = null;
function getNature() {
    if (!instance) {
        instance = new NatureTokenization({
            mintNFT: (nft) => ({ success: true, nft })
        });
    }
    return instance;
}

router.post('/mint/animal/:type/:id', (req, res) => {
    try {
        const nft = getNature().mintAnimal(req.params.type, req.params.id, req.body.wallet || 'default');
        res.json({ success: true, nft });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

router.post('/mint/plant/:id', (req, res) => {
    try {
        const nft = getNature().mintPlant(req.params.id, req.body.wallet || 'default');
        res.json({ success: true, nft });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

router.post('/mint/ecosystem/:id', (req, res) => {
    try {
        const nft = getNature().mintEcosystem(req.params.id, req.body.wallet || 'default');
        res.json({ success: true, nft });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

router.post('/mint/conservation/:id', (req, res) => {
    try {
        const nft = getNature().mintConservation(req.params.id, req.body.wallet || 'default');
        res.json({ success: true, nft });
    } catch (err) { res.status(400).json({ success: false, error: err.message }); }
});

router.get('/registry', (req, res) => {
    res.json({ success: true, registry: getNature().getRegistry() });
});

module.exports = router;
