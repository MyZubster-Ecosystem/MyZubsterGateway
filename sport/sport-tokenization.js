// SPORT Tokenization Module — Bounty #1225
// Tokenizzazione SPORT su MyZubster Chain con NFT minting

const crypto = require('crypto');

// NFT minting store (in-memory; production would use DB/blockchain)
const mintedNFTs = [];

function generateNFTId() {
  return 'NFT-SPORT-' + crypto.randomBytes(8).toString('hex');
}

// ===== DATA =====

const teams = [
  {"id": 1, "name": "Juventus", "league": "Serie A", "country": "Italia", "rarity": "Legendary"},
  {"id": 2, "name": "Milan", "league": "Serie A", "country": "Italia", "rarity": "Legendary"},
  {"id": 3, "name": "Inter", "league": "Serie A", "country": "Italia", "rarity": "Legendary"},
  {"id": 4, "name": "Roma", "league": "Serie A", "country": "Italia", "rarity": "Rare"},
  {"id": 5, "name": "Napoli", "league": "Serie A", "country": "Italia", "rarity": "Rare"},
  {"id": 6, "name": "Fiorentina", "league": "Serie A", "country": "Italia", "rarity": "Uncommon"},
  {"id": 7, "name": "Lazio", "league": "Serie A", "country": "Italia", "rarity": "Uncommon"},
  {"id": 8, "name": "Atalanta", "league": "Serie A", "country": "Italia", "rarity": "Uncommon"}
];

const athletes = [
  {"id": 1, "name": "Messi", "sport": "Calcio", "country": "Argentina", "rarity": "Legendary"},
  {"id": 2, "name": "Ronaldo", "sport": "Calcio", "country": "Portogallo", "rarity": "Legendary"},
  {"id": 3, "name": "Neymar", "sport": "Calcio", "country": "Brasile", "rarity": "Legendary"},
  {"id": 4, "name": "Mbappé", "sport": "Calcio", "country": "Francia", "rarity": "Rare"},
  {"id": 5, "name": "Haaland", "sport": "Calcio", "country": "Norvegia", "rarity": "Rare"},
  {"id": 6, "name": "Lewandowski", "sport": "Calcio", "country": "Polonia", "rarity": "Rare"},
  {"id": 7, "name": "Salah", "sport": "Calcio", "country": "Egitto", "rarity": "Rare"},
  {"id": 8, "name": "Vinicius", "sport": "Calcio", "country": "Brasile", "rarity": "Uncommon"}
];

const stadia = [
  {"id": 1, "name": "San Siro", "city": "Milano", "capacity": 80018, "rarity": "Legendary"},
  {"id": 2, "name": "Olimpico", "city": "Roma", "capacity": 70634, "rarity": "Legendary"},
  {"id": 3, "name": "Maracanã", "city": "Rio de Janeiro", "capacity": 78838, "rarity": "Legendary"},
  {"id": 4, "name": "Camp Nou", "city": "Barcellona", "capacity": 99354, "rarity": "Legendary"},
  {"id": 5, "name": "Wembley", "city": "Londra", "capacity": 90000, "rarity": "Legendary"},
  {"id": 6, "name": "Allianz Arena", "city": "Monaco", "capacity": 75000, "rarity": "Rare"},
  {"id": 7, "name": "Santiago Bernabeu", "city": "Madrid", "capacity": 81044, "rarity": "Legendary"}
];

const events = [
  {"id": 1, "name": "Mondiali FIFA", "year": 2026, "host": "USA/Messico/Canada", "rarity": "Legendary"},
  {"id": 2, "name": "Champions League", "season": "2025-26", "rarity": "Legendary"},
  {"id": 3, "name": "Olimpiadi", "year": 2028, "host": "Los Angeles", "rarity": "Legendary"},
  {"id": 4, "name": "Europei UEFA", "year": 2028, "host": "UK/Irlanda", "rarity": "Rare"}
];

// ===== FUNCTIONS =====

function getStats() {
  const stats = { totalNFTs: mintedNFTs.length, totalObjects: 0 };
  stats.teams = teams.length; stats.totalObjects += teams.length;
  stats.athletes = athletes.length; stats.totalObjects += athletes.length;
  stats.stadia = stadia.length; stats.totalObjects += stadia.length;
  stats.events = events.length; stats.totalObjects += events.length;
  return stats;
}

function mintNFT(type, itemId) {
  const collections = { teams: teams, athletes: athletes, stadia: stadia, events: events };
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
  teams, athletes, stadia, events };
