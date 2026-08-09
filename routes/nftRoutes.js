const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// File di persistenza
const NFT_DB_PATH = path.join(__dirname, '../data/nfts.json');

// Assicura che la cartella data esista
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Carica i dati da file o inizializza
function loadNFTs() {
  try {
    if (fs.existsSync(NFT_DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(NFT_DB_PATH, 'utf8'));
      return data;
    }
  } catch (e) {
    console.error('⚠️ Errore caricamento NFT:', e.message);
  }
  return { nfts: [], counters: {} };
}

// Salva i dati su file
function saveNFTs(data) {
  try {
    fs.writeFileSync(NFT_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('❌ Errore salvataggio NFT:', e.message);
    return false;
  }
}

// Carica i dati
let db = loadNFTs();

// Middleware di autenticazione
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  req.user = { id: 'cosmic-explorer' };
  next();
};

// Funzione per generare tokenId
function generateTokenId(type, count) {
  const prefix = {
    'hera_robot': 'NFT',
    'waste_robot': 'NFT',
    'resource': 'NFT',
    'galaxy': 'NFT',
    'star': 'NFT',
    'planet': 'NFT',
    'constellation': 'NFT',
    'nebula': 'NFT',
    'element': 'NFT',
    'molecule': 'NFT',
    'bounty': 'NFT',
    'test': 'NFT'
  }[type] || 'NFT';
  
  // Conta quanti NFT di questo tipo esistono già
  const typeCount = (db.nfts || []).filter(n => n.type === type).length;
  return `${prefix}-${String(typeCount + count).padStart(6, '0')}`;
}

// ============ MINT NFT ============
router.post('/mint', authMiddleware, (req, res) => {
  try {
    const { type, name, metadata } = req.body;
    
    if (!type || !name) {
      return res.status(400).json({ error: 'type and name required' });
    }
    
    // Calcola il prossimo ID per il tipo
    const typeCount = (db.nfts || []).filter(n => n.type === type).length;
    const nextId = typeCount + 1;
    
    const tokenId = generateTokenId(type, nextId);
    
    const nft = {
      tokenId,
      type,
      name,
      metadata: metadata || {},
      owner: req.user.id || 'cosmic-explorer',
      mintedAt: new Date().toISOString(),
      blockchain: 'MyZubster Chain'
    };
    
    if (!db.nfts) db.nfts = [];
    db.nfts.push(nft);
    
    // Salva su file
    saveNFTs(db);
    
    res.status(201).json({
      success: true,
      message: `✅ ${type} "${name}" tokenizzato!`,
      nft
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET STATS ============
router.get('/stats', (req, res) => {
  try {
    const types = ['hera_robot', 'waste_robot', 'resource', 'galaxy', 'star', 'planet', 'constellation', 'nebula', 'element', 'molecule', 'bounty', 'test'];
    const stats = {};
    let total = 0;
    
    for (const type of types) {
      const count = (db.nfts || []).filter(n => n.type === type).length;
      if (count > 0) {
        stats[type + 's'] = count;
        total += count;
      }
    }
    stats.total = total;
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET ALL NFTs ============
router.get('/all', (req, res) => {
  try {
    const nfts = db.nfts || [];
    res.json({ success: true, total: nfts.length, nfts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET MY NFTs ============
router.get('/my-nfts', authMiddleware, (req, res) => {
  try {
    const nfts = (db.nfts || []).filter(n => n.owner === req.user.id);
    res.json({ success: true, count: nfts.length, nfts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ GET NFT BY TOKEN ID ============
router.get('/token/:tokenId', (req, res) => {
  try {
    const nft = (db.nfts || []).find(n => n.tokenId === req.params.tokenId);
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    res.json({ success: true, nft });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ RELOAD DATABASE ============
router.post('/reload', (req, res) => {
  try {
    db = loadNFTs();
    res.json({ success: true, message: 'NFT database reloaded', total: db.nfts?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
