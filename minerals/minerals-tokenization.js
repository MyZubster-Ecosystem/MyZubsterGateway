// MINERALS Tokenization Module — Bounty #1237
// Tokenizzazione MINERALS su MyZubster Chain con NFT minting

const crypto = require('crypto');

// NFT minting store (in-memory; production would use DB/blockchain)
const mintedNFTs = [];

function generateNFTId() {
  return 'NFT-MINERALS-' + crypto.randomBytes(8).toString('hex');
}

// ===== DATA =====

const preciousMetals = [
  {"id": 1, "name": "Oro", "symbol": "Au", "atomicNumber": 79, "rarity": "Legendary"},
  {"id": 2, "name": "Argento", "symbol": "Ag", "atomicNumber": 47, "rarity": "Rare"},
  {"id": 3, "name": "Platino", "symbol": "Pt", "atomicNumber": 78, "rarity": "Legendary"},
  {"id": 4, "name": "Palladio", "symbol": "Pd", "atomicNumber": 46, "rarity": "Rare"},
  {"id": 5, "name": "Rodio", "symbol": "Rh", "atomicNumber": 45, "rarity": "Legendary"},
  {"id": 6, "name": "Iridio", "symbol": "Ir", "atomicNumber": 77, "rarity": "Legendary"},
  {"id": 7, "name": "Osmio", "symbol": "Os", "atomicNumber": 76, "rarity": "Legendary"},
  {"id": 8, "name": "Rutenio", "symbol": "Ru", "atomicNumber": 44, "rarity": "Uncommon"}
];

const gems = [
  {"id": 1, "name": "Diamante", "hardness": 10, "color": "Incolore", "rarity": "Legendary"},
  {"id": 2, "name": "Smeraldo", "hardness": 7.5, "color": "Verde", "rarity": "Legendary"},
  {"id": 3, "name": "Rubino", "hardness": 9, "color": "Rosso", "rarity": "Legendary"},
  {"id": 4, "name": "Zaffiro", "hardness": 9, "color": "Blu", "rarity": "Rare"},
  {"id": 5, "name": "Opale", "hardness": 5.5, "color": "Multicolore", "rarity": "Rare"},
  {"id": 6, "name": "Topazio", "hardness": 8, "color": "Giallo", "rarity": "Uncommon"},
  {"id": 7, "name": "Ametista", "hardness": 7, "color": "Viola", "rarity": "Common"},
  {"id": 8, "name": "Giada", "hardness": 6.5, "color": "Verde", "rarity": "Rare"}
];

const rareEarths = [
  {"id": 1, "name": "Neodimio", "symbol": "Nd", "atomicNumber": 60, "use": "Magneti", "rarity": "Rare"},
  {"id": 2, "name": "Lantanio", "symbol": "La", "atomicNumber": 57, "use": "Batterie", "rarity": "Uncommon"},
  {"id": 3, "name": "Cerio", "symbol": "Ce", "atomicNumber": 58, "use": "Catalizzatori", "rarity": "Uncommon"},
  {"id": 4, "name": "Praseodimio", "symbol": "Pr", "atomicNumber": 59, "use": "Laser", "rarity": "Rare"},
  {"id": 5, "name": "Samario", "symbol": "Sm", "atomicNumber": 62, "use": "Magneti", "rarity": "Rare"},
  {"id": 6, "name": "Europio", "symbol": "Eu", "atomicNumber": 63, "use": "Display", "rarity": "Rare"},
  {"id": 7, "name": "Gadolinio", "symbol": "Gd", "atomicNumber": 64, "use": "MRI", "rarity": "Rare"},
  {"id": 8, "name": "Disprosio", "symbol": "Dy", "atomicNumber": 66, "use": "Magneti", "rarity": "Rare"}
];

const industrialMinerals = [
  {"id": 1, "name": "Quarzo", "hardness": 7, "use": "Elettronica", "rarity": "Common"},
  {"id": 2, "name": "Feldspato", "hardness": 6, "use": "Ceramica", "rarity": "Common"},
  {"id": 3, "name": "Calcite", "hardness": 3, "use": "Edilizia", "rarity": "Common"},
  {"id": 4, "name": "Mica", "hardness": 2.5, "use": "Isolante", "rarity": "Common"},
  {"id": 5, "name": "Talco", "hardness": 1, "use": "Cosmetica", "rarity": "Common"},
  {"id": 6, "name": "Gesso", "hardness": 2, "use": "Edilizia", "rarity": "Common"},
  {"id": 7, "name": "Caolino", "hardness": 2, "use": "Porcellana", "rarity": "Uncommon"},
  {"id": 8, "name": "Bentonite", "hardness": 1.5, "use": "Perforazione", "rarity": "Uncommon"}
];

// ===== FUNCTIONS =====

function getStats() {
  const stats = { totalNFTs: mintedNFTs.length, totalObjects: 0 };
  stats.preciousMetals = preciousMetals.length; stats.totalObjects += preciousMetals.length;
  stats.gems = gems.length; stats.totalObjects += gems.length;
  stats.rareEarths = rareEarths.length; stats.totalObjects += rareEarths.length;
  stats.industrialMinerals = industrialMinerals.length; stats.totalObjects += industrialMinerals.length;
  return stats;
}

function mintNFT(type, itemId) {
  const collections = { preciousMetals: preciousMetals, gems: gems, rareEarths: rareEarths, industrialMinerals: industrialMinerals };
  const collection = collections[type];
  if (!collection) return { success: false, error: `Unknown type: ${type}` };
  
  const item = collection.find(i => i.id === itemId);
  if (!item) return { success: false, error: `Item not found: ${type}/${itemId}` };
  
  const nft = {
    tokenId: generateNFTId(),
    type,
    itemId: item.id,
    name: item.name,
    rarity: item.rarity || 'Common',
    mintedAt: new Date().toISOString(),
    ...item
  };
  
  mintedNFTs.push(nft);
  return { success: true, tokenId: nft.tokenId, nft };
}

function getNFT(nftId) {
  const nft = mintedNFTs.find(n => n.tokenId === nftId);
  if (!nft) return { success: false, error: 'NFT not found' };
  return { success: true, nft };
}

function getAllNFTs() {
  return { success: true, count: mintedNFTs.length, nfts: mintedNFTs };
}

module.exports = { getStats, mintNFT, getNFT, getAllNFTs, 
  preciousMetals, gems, rareEarths, industrialMinerals };
