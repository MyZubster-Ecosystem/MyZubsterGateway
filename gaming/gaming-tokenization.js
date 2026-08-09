// GAMING Tokenization Module — Bounty #1229
// Tokenizzazione GAMING su MyZubster Chain con NFT minting

const crypto = require('crypto');

// NFT minting store (in-memory; production would use DB/blockchain)
const mintedNFTs = [];

function generateNFTId() {
  return 'NFT-GAMING-' + crypto.randomBytes(8).toString('hex');
}

// ===== DATA =====

const games = [
  {"id": 1, "name": "Super Mario", "developer": "Nintendo", "year": 1985, "genre": "Platform", "rarity": "Legendary"},
  {"id": 2, "name": "The Legend of Zelda", "developer": "Nintendo", "year": 1986, "genre": "Adventure", "rarity": "Legendary"},
  {"id": 3, "name": "Final Fantasy", "developer": "Square Enix", "year": 1987, "genre": "RPG", "rarity": "Legendary"},
  {"id": 4, "name": "Minecraft", "developer": "Mojang", "year": 2011, "genre": "Sandbox", "rarity": "Legendary"},
  {"id": 5, "name": "Fortnite", "developer": "Epic Games", "year": 2017, "genre": "Battle Royale", "rarity": "Rare"},
  {"id": 6, "name": "Call of Duty", "developer": "Activision", "year": 2003, "genre": "FPS", "rarity": "Rare"}
];

const characters = [
  {"id": 1, "name": "Mario", "game": "Super Mario", "rarity": "Legendary"},
  {"id": 2, "name": "Link", "game": "Zelda", "rarity": "Legendary"},
  {"id": 3, "name": "Kratos", "game": "God of War", "rarity": "Legendary"},
  {"id": 4, "name": "Lara Croft", "game": "Tomb Raider", "rarity": "Legendary"},
  {"id": 5, "name": "Sonic", "game": "Sonic", "rarity": "Rare"},
  {"id": 6, "name": "Pikachu", "game": "Pokémon", "rarity": "Legendary"}
];

const consoles = [
  {"id": 1, "name": "NES", "brand": "Nintendo", "year": 1983, "rarity": "Legendary"},
  {"id": 2, "name": "Game Boy", "brand": "Nintendo", "year": 1989, "rarity": "Legendary"},
  {"id": 3, "name": "PlayStation", "brand": "Sony", "year": 1994, "rarity": "Legendary"},
  {"id": 4, "name": "Xbox", "brand": "Microsoft", "year": 2001, "rarity": "Rare"},
  {"id": 5, "name": "Nintendo Switch", "brand": "Nintendo", "year": 2017, "rarity": "Rare"}
];

const esports = [
  {"id": 1, "name": "LoL Worlds", "game": "League of Legends", "prize": "$2M+", "rarity": "Legendary"},
  {"id": 2, "name": "The International", "game": "Dota 2", "prize": "$40M+", "rarity": "Legendary"},
  {"id": 3, "name": "EVO", "game": "Fighting Games", "prize": "$500K+", "rarity": "Rare"},
  {"id": 4, "name": "Fortnite World Cup", "game": "Fortnite", "prize": "$30M", "rarity": "Rare"}
];

// ===== FUNCTIONS =====

function getStats() {
  const stats = { totalNFTs: mintedNFTs.length, totalObjects: 0 };
  stats.games = games.length; stats.totalObjects += games.length;
  stats.characters = characters.length; stats.totalObjects += characters.length;
  stats.consoles = consoles.length; stats.totalObjects += consoles.length;
  stats.esports = esports.length; stats.totalObjects += esports.length;
  return stats;
}

function mintNFT(type, itemId) {
  const collections = { games: games, characters: characters, consoles: consoles, esports: esports };
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
  games, characters, consoles, esports };
