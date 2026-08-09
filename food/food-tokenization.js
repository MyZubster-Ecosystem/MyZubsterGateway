// FOOD Tokenization Module — Bounty #1227
// Tokenizzazione FOOD su MyZubster Chain con NFT minting

const crypto = require('crypto');

// NFT minting store (in-memory; production would use DB/blockchain)
const mintedNFTs = [];

function generateNFTId() {
  return 'NFT-FOOD-' + crypto.randomBytes(8).toString('hex');
}

// ===== DATA =====

const recipes = [
  {"id": 1, "name": "Pizza Margherita", "origin": "Napoli", "difficulty": "Media", "rarity": "Common"},
  {"id": 2, "name": "Pasta alla Carbonara", "origin": "Roma", "difficulty": "Media", "rarity": "Common"},
  {"id": 3, "name": "Risotto alla Milanese", "origin": "Milano", "difficulty": "Alta", "rarity": "Uncommon"},
  {"id": 4, "name": "Lasagna", "origin": "Emilia-Romagna", "difficulty": "Alta", "rarity": "Common"},
  {"id": 5, "name": "Gelato Artigianale", "origin": "Firenze", "difficulty": "Media", "rarity": "Common"},
  {"id": 6, "name": "Tiramisù", "origin": "Veneto", "difficulty": "Bassa", "rarity": "Common"}
];

const restaurants = [
  {"id": 1, "name": "Osteria Francescana", "chef": "Massimo Bottura", "city": "Modena", "stars": 3, "rarity": "Legendary"},
  {"id": 2, "name": "Da Vittorio", "chef": "Chicco Cerea", "city": "Brusaporto", "stars": 3, "rarity": "Rare"},
  {"id": 3, "name": "La Pergola", "chef": "Heinz Beck", "city": "Roma", "stars": 3, "rarity": "Rare"},
  {"id": 4, "name": "Enoteca Pinchiorri", "chef": "Annie Féolde", "city": "Firenze", "stars": 3, "rarity": "Rare"}
];

const chefs = [
  {"id": 1, "name": "Massimo Bottura", "specialty": "Cucina Creativa", "country": "Italia", "rarity": "Legendary"},
  {"id": 2, "name": "Niko Romito", "specialty": "Cucina Italiana", "country": "Italia", "rarity": "Rare"},
  {"id": 3, "name": "Carlo Cracco", "specialty": "Alta Cucina", "country": "Italia", "rarity": "Rare"},
  {"id": 4, "name": "Antonino Cannavacciuolo", "specialty": "Cucina Mediterranea", "country": "Italia", "rarity": "Rare"}
];

const wines = [
  {"id": 1, "name": "Chianti Classico", "region": "Toscana", "type": "Rosso", "rarity": "Common"},
  {"id": 2, "name": "Barolo", "region": "Piemonte", "type": "Rosso", "rarity": "Rare"},
  {"id": 3, "name": "Brunello di Montalcino", "region": "Toscana", "type": "Rosso", "rarity": "Rare"},
  {"id": 4, "name": "Prosecco", "region": "Veneto", "type": "Spumante", "rarity": "Common"},
  {"id": 5, "name": "Amarone", "region": "Veneto", "type": "Rosso", "rarity": "Rare"}
];

// ===== FUNCTIONS =====

function getStats() {
  const stats = { totalNFTs: mintedNFTs.length, totalObjects: 0 };
  stats.recipes = recipes.length; stats.totalObjects += recipes.length;
  stats.restaurants = restaurants.length; stats.totalObjects += restaurants.length;
  stats.chefs = chefs.length; stats.totalObjects += chefs.length;
  stats.wines = wines.length; stats.totalObjects += wines.length;
  return stats;
}

function mintNFT(type, itemId) {
  const collections = { recipes: recipes, restaurants: restaurants, chefs: chefs, wines: wines };
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
  recipes, restaurants, chefs, wines };
