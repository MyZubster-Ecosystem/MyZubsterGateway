const express = require('express');
const router = express.Router();

// Database NFT in memoria
const nftDB = {
  nfts: [],
  counters: {}
};

// Middleware di autenticazione
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  // Per test, accetta qualsiasi token
  req.user = { id: 'cosmic-explorer' };
  next();
};

// Funzione per generare tokenId
function generateTokenId(type, count) {
  const prefix = {
    'galaxy': 'GALAXY',
    'star': 'STAR',
    'planet': 'PLANET',
    'constellation': 'CONST',
    'nebula': 'NEBULA',
    'element': 'ELEMENT',
    'molecule': 'MOLECULE',
    'bounty': 'BOUNTY'
  }[type] || 'NFT';
  return `${prefix}-${String(count).padStart(6, '0')}`;
}

// ============ MINT NFT ============
router.post('/mint', authMiddleware, (req, res) => {
  try {
    const { type, name, metadata } = req.body;
    
    if (!type || !name) {
      return res.status(400).json({ error: 'type and name required' });
    }
    
    // Incrementa il contatore
    if (!nftDB.counters[type]) nftDB.counters[type] = 0;
    nftDB.counters[type]++;
    
    const tokenId = generateTokenId(type, nftDB.counters[type]);
    
    const nft = {
      tokenId,
      type,
      name,
      metadata: metadata || {},
      owner: req.user.id,
      mintedAt: new Date().toISOString(),
      blockchain: 'MyZubster Chain'
    };
    
    nftDB.nfts.push(nft);
    
    res.status(201).json({
      success: true,
      message: `✅ ${type} "${name}" tokenizzato!`,
      nft
    });
  } catch (error) {
    console.error('❌ Errore mint:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ GET STATS ============
router.get('/stats', (req, res) => {
  try {
    const types = ['galaxy', 'star', 'planet', 'constellation', 'nebula', 'element', 'molecule', 'bounty'];
    const stats = {};
    let total = 0;
    
    for (const type of types) {
      const count = nftDB.nfts.filter(n => n.type === type).length;
      stats[type + 's'] = count;
      total += count;
    }
    stats.total = total;
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET ALL NFTs ============
router.get('/all', (req, res) => {
  res.json({ success: true, total: nftDB.nfts.length, nfts: nftDB.nfts });
});

// ============ GET MY NFTs ============
router.get('/my-nfts', authMiddleware, (req, res) => {
  const nfts = nftDB.nfts.filter(n => n.owner === req.user.id);
  res.json({ success: true, count: nfts.length, nfts });
});

// ============ GET NFT BY TOKEN ID ============
router.get('/token/:tokenId', (req, res) => {
  const nft = nftDB.nfts.find(n => n.tokenId === req.params.tokenId);
  if (!nft) {
    return res.status(404).json({ error: 'NFT not found' });
  }
  res.json({ success: true, nft });
});

// ============ DEBUG: RESET NFT DATABASE ============
router.post('/reset', (req, res) => {
  nftDB.nfts = [];
  nftDB.counters = {};
  res.json({ success: true, message: 'NFT database resettato' });
});

module.exports = router;
