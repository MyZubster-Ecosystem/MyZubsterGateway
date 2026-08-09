// CITIES Tokenization Module — Bounty #1228
// Tokenizzazione CITIES su MyZubster Chain con NFT minting

const crypto = require('crypto');

// NFT minting store (in-memory; production would use DB/blockchain)
const mintedNFTs = [];

function generateNFTId() {
  return 'NFT-CITIES-' + crypto.randomBytes(8).toString('hex');
}

// ===== DATA =====

const landmarks = [
  {"id": 1, "name": "Colosseo", "city": "Roma", "year": 80, "rarity": "Legendary"},
  {"id": 2, "name": "Torre Eiffel", "city": "Parigi", "year": 1889, "rarity": "Legendary"},
  {"id": 3, "name": "Big Ben", "city": "Londra", "year": 1859, "rarity": "Legendary"},
  {"id": 4, "name": "Ponte Vecchio", "city": "Firenze", "year": 1345, "rarity": "Rare"},
  {"id": 5, "name": "Guglia di Giotto", "city": "Firenze", "year": 1359, "rarity": "Rare"}
];

const fountains = [
  {"id": 1, "name": "Fontana di Trevi", "city": "Roma", "year": 1762, "rarity": "Legendary"},
  {"id": 2, "name": "Fontana dell'Esedra", "city": "Roma", "year": 1901, "rarity": "Uncommon"},
  {"id": 3, "name": "Fontana del Nettuno", "city": "Bologna", "year": 1567, "rarity": "Rare"},
  {"id": 4, "name": "Fontana dei Quattro Fiumi", "city": "Roma", "year": 1651, "rarity": "Rare"}
];

const squares = [
  {"id": 1, "name": "Piazza San Marco", "city": "Venezia", "rarity": "Legendary"},
  {"id": 2, "name": "Piazza del Duomo", "city": "Milano", "rarity": "Legendary"},
  {"id": 3, "name": "Piazza Navona", "city": "Roma", "rarity": "Rare"},
  {"id": 4, "name": "Piazza di Spagna", "city": "Roma", "rarity": "Rare"}
];

const buildings = [
  {"id": 1, "name": "Palazzo Vecchio", "city": "Firenze", "year": 1299, "rarity": "Legendary"},
  {"id": 2, "name": "Duomo di Milano", "city": "Milano", "year": 1965, "rarity": "Legendary"},
  {"id": 3, "name": "Basilica di San Pietro", "city": "Città del Vaticano", "year": 1626, "rarity": "Legendary"},
  {"id": 4, "name": "Castel Sant'Angelo", "city": "Roma", "year": 139, "rarity": "Rare"},
  {"id": 5, "name": "Palazzo Ducale", "city": "Venezia", "year": 1340, "rarity": "Rare"}
];

// ===== FUNCTIONS =====

function getStats() {
  const stats = { totalNFTs: mintedNFTs.length, totalObjects: 0 };
  stats.landmarks = landmarks.length; stats.totalObjects += landmarks.length;
  stats.fountains = fountains.length; stats.totalObjects += fountains.length;
  stats.squares = squares.length; stats.totalObjects += squares.length;
  stats.buildings = buildings.length; stats.totalObjects += buildings.length;
  return stats;
}

function mintNFT(type, itemId) {
  const collections = { landmarks: landmarks, fountains: fountains, squares: squares, buildings: buildings };
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
  landmarks, fountains, squares, buildings };
