'use strict';

const express = require('express');
const wallet = require('../gateway/tari_nft_wallet');
const { TariNftService } = require('../services/tariNftService');

function createTariNftRouter(options = {}) {
  const router = express.Router();
  const service = options.service || new TariNftService({ wallet });
  const handler = (action, successStatus = 200) => async (req, res) => {
    try { res.status(successStatus).json({ success: true, data: await action(req) }); }
    catch (error) {
      const clientError = /required|not found|Only|already|cannot|positive/i.test(error.message);
      res.status(clientError ? 400 : 502).json({ success: false, error: error.message });
    }
  };
  router.post('/species', handler((req) => service.mintSpecies(req.body), 201));
  router.get('/owners/:owner', handler((req) => service.repository.tokensByOwner(req.params.owner)));
  router.get('/marketplace', handler(() => service.repository.activeListings()));
  router.post('/marketplace', handler((req) => service.createListing(req.body), 201));
  router.post('/marketplace/:listingId/purchase', handler((req) => service.purchase({ ...req.body, listingId: req.params.listingId })));
  return router;
}

module.exports = { createTariNftRouter };
