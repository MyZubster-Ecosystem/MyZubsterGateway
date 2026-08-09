// Nature Tokenization Module — Bounty #1224
// Tokenizzazione Animali, Piante, Ecosistemi, Conservazione su MyZubster Chain

const crypto = require('crypto');

// NFT minting store (in-memory; production would use DB/blockchain)
const mintedNFTs = [];

function generateNFTId() {
  return 'NFT-NATURE-' + crypto.randomBytes(8).toString('hex');
}

// ===== DATA =====

const animals = [
  { id: 1, name: 'Cane (Dog)', scientificName: 'Canis lupus familiaris', category: 'Domestico', rarity: 'Common' },
  { id: 2, name: 'Gatto (Cat)', scientificName: 'Felis catus', category: 'Domestico', rarity: 'Common' },
  { id: 3, name: 'Cavallo (Horse)', scientificName: 'Equus ferus caballus', category: 'Domestico', rarity: 'Uncommon' },
  { id: 4, name: 'Pappagallo (Parrot)', scientificName: 'Psittaciformes', category: 'Domestico', rarity: 'Rare' },
  { id: 5, name: 'Coniglio (Rabbit)', scientificName: 'Oryctolagus cuniculus', category: 'Domestico', rarity: 'Common' },
  { id: 6, name: 'Pesce Rosso (Goldfish)', scientificName: 'Carassius auratus', category: 'Domestico', rarity: 'Common' },
  { id: 7, name: 'Leone (Lion)', scientificName: 'Panthera leo', category: 'Selvatico', rarity: 'Legendary' },
  { id: 8, name: 'Tigre (Tiger)', scientificName: 'Panthera tigris', category: 'Selvatico', rarity: 'Legendary' },
  { id: 9, name: 'Elefante (Elephant)', scientificName: 'Loxodonta africana', category: 'Selvatico', rarity: 'Legendary' },
  { id: 10, name: 'Aquila (Eagle)', scientificName: 'Aquila chrysaetos', category: 'Selvatico', rarity: 'Rare' },
  { id: 11, name: 'Lupo (Wolf)', scientificName: 'Canis lupus', category: 'Selvatico', rarity: 'Rare' },
  { id: 12, name: 'Delfino (Dolphin)', scientificName: 'Delphinus delphis', category: 'Selvatico', rarity: 'Rare' },
  { id: 13, name: 'Orso Bruno (Brown Bear)', scientificName: 'Ursus arctos', category: 'Selvatico', rarity: 'Uncommon' },
  { id: 14, name: 'Cervo (Deer)', scientificName: 'Cervus elaphus', category: 'Selvatico', rarity: 'Uncommon' },
  { id: 15, name: 'Volpe (Fox)', scientificName: 'Vulpes vulpes', category: 'Selvatico', rarity: 'Uncommon' }
];

const plants = [
  { id: 1, name: 'Quercia (Oak)', scientificName: 'Quercus robur', type: 'Albero', rarity: 'Common' },
  { id: 2, name: 'Rosa (Rose)', scientificName: 'Rosa gallica', type: 'Fiore', rarity: 'Common' },
  { id: 3, name: 'Olivo (Olive Tree)', scientificName: 'Olea europaea', type: 'Albero', rarity: 'Uncommon' },
  { id: 4, name: 'Girasole (Sunflower)', scientificName: 'Helianthus annuus', type: 'Fiore', rarity: 'Common' },
  { id: 5, name: 'Lavanda (Lavender)', scientificName: 'Lavandula angustifolia', type: 'Arbusto', rarity: 'Common' },
  { id: 6, name: 'Sequoia (Redwood)', scientificName: 'Sequoiadendron giganteum', type: 'Albero', rarity: 'Legendary' },
  { id: 7, name: 'Orchidea (Orchid)', scientificName: 'Orchidaceae', type: 'Fiore', rarity: 'Rare' },
  { id: 8, name: 'Bambu (Bamboo)', scientificName: 'Bambusoideae', type: 'Erba', rarity: 'Uncommon' },
  { id: 9, name: 'Cactus Saguaro', scientificName: 'Carnegiea gigantea', type: 'Succulenta', rarity: 'Rare' },
  { id: 10, name: 'Ninfea (Water Lily)', scientificName: 'Nymphaea alba', type: 'Acquatica', rarity: 'Uncommon' }
];

const ecosystems = [
  { id: 1, name: 'Foresta Amazzonica', location: 'Sud America', area_km2: 5500000, biodiversity: 'Altissima' },
  { id: 2, name: 'Barriera Corallina', location: 'Australia', area_km2: 344400, biodiversity: 'Altissima' },
  { id: 3, name: 'Savana Africana', location: 'Africa', area_km2: 13000000, biodiversity: 'Alta' },
  { id: 4, name: 'Tundra Artica', location: 'Artide', area_km2: 11500000, biodiversity: 'Media' },
  { id: 5, name: 'Foresta Pluviale Temperata', location: 'Pacifico NW', area_km2: 75000, biodiversity: 'Alta' },
  { id: 6, name: 'Delta del Danubio', location: 'Romania/Ucraina', area_km2: 4152, biodiversity: 'Altissima' }
];

const conservation = [
  { id: 1, name: 'Parco Nazionale Yellowstone', country: 'USA', area_km2: 8983, status: 'Protected' },
  { id: 2, name: 'Parco Nazionale del Gran Paradiso', country: 'Italia', area_km2: 703, status: 'Protected' },
  { id: 3, name: 'Riserva Marina Galapagos', country: 'Ecuador', area_km2: 133000, status: 'Marine Reserve' }
];

// ===== NFT MINTING FUNCTIONS =====

function mintNFT(category, item, wallet) {
  const nftId = generateNFTId();
  const timestamp = new Date().toISOString();
  const nft = {
    id: nftId,
    category,
    itemId: item.id,
    name: item.name,
    scientificName: item.scientificName || null,
    rarity: item.rarity || null,
    wallet,
    mintedAt: timestamp,
    tokenURI: `https://api.myzubster.com/nft/nature/${nftId}`
  };
  mintedNFTs.push(nft);
  return nft;
}

function batchMint(category, wallet) {
  const items = { animals, plants, ecosystems, conservation }[category];
  if (!items) throw new Error('Invalid category');
  return items.map(item => mintNFT(category, item, wallet));
}

function getNFTsByWallet(wallet) {
  return mintedNFTs.filter(n => n.wallet === wallet);
}

function getStats() {
  const byCategory = {};
  mintedNFTs.forEach(n => {
    byCategory[n.category] = (byCategory[n.category] || 0) + 1;
  });
  return {
    totalMinted: mintedNFTs.length,
    byCategory,
    categories: {
      animals: animals.length,
      plants: plants.length,
      ecosystems: ecosystems.length,
      conservation: conservation.length
    }
  };
}

module.exports = {
  animals,
  plants,
  ecosystems,
  conservation,
  mintNFT,
  batchMint,
  getNFTsByWallet,
  getStats
};
