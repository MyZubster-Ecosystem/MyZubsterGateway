// CHEMISTRY Tokenization Module — Bounty #1245
// Tokenizzazione CHEMISTRY su MyZubster Chain con NFT minting

const crypto = require('crypto');

// NFT minting store (in-memory; production would use DB/blockchain)
const mintedNFTs = [];

function generateNFTId() {
  return 'NFT-CHEMISTRY-' + crypto.randomBytes(8).toString('hex');
}

// ===== DATA =====

const elements = [
  {"id": 1, "name": "Idrogeno", "symbol": "H", "atomicNumber": 1, "group": "Non-metallo", "rarity": "Common"},
  {"id": 2, "name": "Elio", "symbol": "He", "atomicNumber": 2, "group": "Gas nobile", "rarity": "Common"},
  {"id": 3, "name": "Litio", "symbol": "Li", "atomicNumber": 3, "group": "Metallo alcalino", "rarity": "Uncommon"},
  {"id": 4, "name": "Berillio", "symbol": "Be", "atomicNumber": 4, "group": "Metallo alcalino-terroso", "rarity": "Rare"},
  {"id": 5, "name": "Boro", "symbol": "B", "atomicNumber": 5, "group": "Metalloide", "rarity": "Uncommon"},
  {"id": 6, "name": "Carbonio", "symbol": "C", "atomicNumber": 6, "group": "Non-metallo", "rarity": "Common"},
  {"id": 7, "name": "Azoto", "symbol": "N", "atomicNumber": 7, "group": "Non-metallo", "rarity": "Common"},
  {"id": 8, "name": "Ossigeno", "symbol": "O", "atomicNumber": 8, "group": "Non-metallo", "rarity": "Common"},
  {"id": 9, "name": "Fluoro", "symbol": "F", "atomicNumber": 9, "group": "Alogeno", "rarity": "Uncommon"},
  {"id": 10, "name": "Neon", "symbol": "Ne", "atomicNumber": 10, "group": "Gas nobile", "rarity": "Uncommon"},
  {"id": 11, "name": "Sodio", "symbol": "Na", "atomicNumber": 11, "group": "Metallo alcalino", "rarity": "Common"},
  {"id": 12, "name": "Magnesio", "symbol": "Mg", "atomicNumber": 12, "group": "Metallo alcalino-terroso", "rarity": "Common"},
  {"id": 13, "name": "Alluminio", "symbol": "Al", "atomicNumber": 13, "group": "Metallo", "rarity": "Common"},
  {"id": 14, "name": "Silicio", "symbol": "Si", "atomicNumber": 14, "group": "Metalloide", "rarity": "Common"},
  {"id": 15, "name": "Fosforo", "symbol": "P", "atomicNumber": 15, "group": "Non-metallo", "rarity": "Uncommon"},
  {"id": 16, "name": "Zolfo", "symbol": "S", "atomicNumber": 16, "group": "Non-metallo", "rarity": "Common"},
  {"id": 17, "name": "Cloro", "symbol": "Cl", "atomicNumber": 17, "group": "Alogeno", "rarity": "Common"},
  {"id": 18, "name": "Argon", "symbol": "Ar", "atomicNumber": 18, "group": "Gas nobile", "rarity": "Uncommon"},
  {"id": 19, "name": "Potassio", "symbol": "K", "atomicNumber": 19, "group": "Metallo alcalino", "rarity": "Common"},
  {"id": 20, "name": "Calcio", "symbol": "Ca", "atomicNumber": 20, "group": "Metallo alcalino-terroso", "rarity": "Common"},
  {"id": 21, "name": "Scandio", "symbol": "Sc", "atomicNumber": 21, "group": "Metallo di transizione", "rarity": "Rare"},
  {"id": 22, "name": "Titanio", "symbol": "Ti", "atomicNumber": 22, "group": "Metallo di transizione", "rarity": "Uncommon"},
  {"id": 23, "name": "Vanadio", "symbol": "V", "atomicNumber": 23, "group": "Metallo di transizione", "rarity": "Rare"},
  {"id": 24, "name": "Cromo", "symbol": "Cr", "atomicNumber": 24, "group": "Metallo di transizione", "rarity": "Uncommon"},
  {"id": 25, "name": "Manganese", "symbol": "Mn", "atomicNumber": 25, "group": "Metallo di transizione", "rarity": "Uncommon"},
  {"id": 26, "name": "Ferro", "symbol": "Fe", "atomicNumber": 26, "group": "Metallo di transizione", "rarity": "Common"},
  {"id": 27, "name": "Cobalto", "symbol": "Co", "atomicNumber": 27, "group": "Metallo di transizione", "rarity": "Rare"},
  {"id": 28, "name": "Nichel", "symbol": "Ni", "atomicNumber": 28, "group": "Metallo di transizione", "rarity": "Uncommon"},
  {"id": 29, "name": "Rame", "symbol": "Cu", "atomicNumber": 29, "group": "Metallo di transizione", "rarity": "Common"},
  {"id": 30, "name": "Zinco", "symbol": "Zn", "atomicNumber": 30, "group": "Metallo di transizione", "rarity": "Common"}
];

const compounds = [
  {"id": 1, "name": "Acqua", "formula": "H₂O", "type": "Ossido", "rarity": "Common"},
  {"id": 2, "name": "Sale da Cucina", "formula": "NaCl", "type": "Sale", "rarity": "Common"},
  {"id": 3, "name": "Anidride Carbonica", "formula": "CO₂", "type": "Ossido", "rarity": "Common"},
  {"id": 4, "name": "Ammoniaca", "formula": "NH₃", "type": "Idruro", "rarity": "Common"},
  {"id": 5, "name": "Acido Solforico", "formula": "H₂SO₄", "type": "Acido", "rarity": "Uncommon"},
  {"id": 6, "name": "Acido Cloridrico", "formula": "HCl", "type": "Acido", "rarity": "Uncommon"},
  {"id": 7, "name": "Metano", "formula": "CH₄", "type": "Idrocarburo", "rarity": "Common"},
  {"id": 8, "name": "Etanolo", "formula": "C₂H₅OH", "type": "Alcol", "rarity": "Common"},
  {"id": 9, "name": "Glucosio", "formula": "C₆H₁₂O₆", "type": "Zucchero", "rarity": "Common"},
  {"id": 10, "name": "DNA", "formula": "C₁₅H₃₁N₃O₁₃P₂", "type": "Acido Nucleico", "rarity": "Legendary"}
];

const molecules = [
  {"id": 1, "name": "H₂O", "atoms": 3, "type": "Triatomica", "rarity": "Common"},
  {"id": 2, "name": "NaCl", "atoms": 2, "type": "Biatomica", "rarity": "Common"},
  {"id": 3, "name": "CO₂", "atoms": 3, "type": "Triatomica", "rarity": "Common"},
  {"id": 4, "name": "NH₃", "atoms": 4, "type": "Tetratomica", "rarity": "Common"},
  {"id": 5, "name": "H₂SO₄", "atoms": 7, "type": "Poliatomica", "rarity": "Uncommon"},
  {"id": 6, "name": "HCl", "atoms": 2, "type": "Biatomica", "rarity": "Common"},
  {"id": 7, "name": "CH₄", "atoms": 5, "type": "Pentatomica", "rarity": "Common"},
  {"id": 8, "name": "C₂H₅OH", "atoms": 9, "type": "Poliatomica", "rarity": "Common"},
  {"id": 9, "name": "C₆H₁₂O₆", "atoms": 24, "type": "Poliatomica", "rarity": "Uncommon"},
  {"id": 10, "name": "C₆₀ (Fullerene)", "atoms": 60, "type": "Macromolecola", "rarity": "Legendary"}
];

const reactions = [
  {"id": 1, "name": "Combustione", "equation": "CH₄ + 2O₂ → CO₂ + 2H₂O", "type": "Ossidoriduzione", "rarity": "Common"},
  {"id": 2, "name": "Fotosintesi", "equation": "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂", "type": "Biochimica", "rarity": "Common"},
  {"id": 3, "name": "Neutralizzazione", "equation": "HCl + NaOH → NaCl + H₂O", "type": "Acido-Base", "rarity": "Common"},
  {"id": 4, "name": "Fermentazione", "equation": "C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂", "type": "Biochimica", "rarity": "Common"},
  {"id": 5, "name": "Sintesi Haber", "equation": "N₂ + 3H₂ ⇌ 2NH₃", "type": "Sintesi", "rarity": "Rare"},
  {"id": 6, "name": "Elettrolisi", "equation": "2H₂O → 2H₂ + O₂", "type": "Elettrochimica", "rarity": "Uncommon"},
  {"id": 7, "name": "Saponificazione", "equation": "Grasso + NaOH → Sapone + Glicerolo", "type": "Organica", "rarity": "Uncommon"},
  {"id": 8, "name": "Polimerizzazione", "equation": "n(CH₂=CH₂) → (CH₂-CH₂)n", "type": "Sintesi", "rarity": "Rare"},
  {"id": 9, "name": "Ossidazione del Ferro", "equation": "4Fe + 3O₂ → 2Fe₂O₃", "type": "Ossidoriduzione", "rarity": "Common"},
  {"id": 10, "name": "Fissione Nucleare", "equation": "²³⁵U + n → ¹⁴¹Ba + ⁹²Kr + 3n", "type": "Nucleare", "rarity": "Legendary"}
];

const materials = [
  {"id": 1, "name": "Acciaio", "composition": "Fe + C", "use": "Costruzione", "rarity": "Common"},
  {"id": 2, "name": "Vetro", "composition": "SiO₂", "use": "Finestre", "rarity": "Common"},
  {"id": 3, "name": "Plastica PET", "composition": "(C₁₀H₈O₄)n", "use": "Imballaggio", "rarity": "Common"},
  {"id": 4, "name": "Nylon", "composition": "Poliammide", "use": "Tessile", "rarity": "Common"},
  {"id": 5, "name": "Grafene", "composition": "C", "use": "Elettronica", "rarity": "Legendary"},
  {"id": 6, "name": "Kevlar", "composition": "Aramide", "use": "Protezione", "rarity": "Rare"},
  {"id": 7, "name": "Silicone", "composition": "(R₂SiO)n", "use": "Medicale", "rarity": "Uncommon"},
  {"id": 8, "name": "Ceramica", "composition": "Argilla", "use": "Arte", "rarity": "Common"},
  {"id": 9, "name": "Teflon", "composition": "(C₂F₄)n", "use": "Antiaderente", "rarity": "Uncommon"},
  {"id": 10, "name": "Nitinol", "composition": "NiTi", "use": "Medicale", "rarity": "Rare"}
];

const discoveries = [
  {"id": 1, "name": "Tavola Periodica", "discoverer": "Mendeleev", "year": 1869, "rarity": "Legendary"},
  {"id": 2, "name": "Struttura del DNA", "discoverer": "Watson & Crick", "year": 1953, "rarity": "Legendary"},
  {"id": 3, "name": "Radioattività", "discoverer": "Becquerel", "year": 1896, "rarity": "Legendary"},
  {"id": 4, "name": "Penicillina", "discoverer": "Fleming", "year": 1928, "rarity": "Legendary"},
  {"id": 5, "name": "Fullerene C₆₀", "discoverer": "Kroto, Curl, Smalley", "year": 1985, "rarity": "Rare"}
];

const nobelPrizes = [
  {"id": 1, "name": "Marie Curie", "discovery": "Radioattività", "year": 1911, "rarity": "Legendary"},
  {"id": 2, "name": "Linus Pauling", "discovery": "Legame Chimico", "year": 1954, "rarity": "Legendary"},
  {"id": 3, "name": "Frances Arnold", "discovery": "Evoluzione Enzimatica", "year": 2018, "rarity": "Rare"},
  {"id": 4, "name": "Emmanuelle Charpentier & Jennifer Doudna", "discovery": "CRISPR-Cas9", "year": 2020, "rarity": "Legendary"}
];

// ===== FUNCTIONS =====

function getStats() {
  const stats = { totalNFTs: mintedNFTs.length, totalObjects: 0 };
  stats.elements = elements.length; stats.totalObjects += elements.length;
  stats.compounds = compounds.length; stats.totalObjects += compounds.length;
  stats.molecules = molecules.length; stats.totalObjects += molecules.length;
  stats.reactions = reactions.length; stats.totalObjects += reactions.length;
  stats.materials = materials.length; stats.totalObjects += materials.length;
  stats.discoveries = discoveries.length; stats.totalObjects += discoveries.length;
  stats.nobelPrizes = nobelPrizes.length; stats.totalObjects += nobelPrizes.length;
  return stats;
}

function mintNFT(type, itemId) {
  const collections = { elements: elements, compounds: compounds, molecules: molecules, reactions: reactions, materials: materials, discoveries: discoveries, nobelPrizes: nobelPrizes };
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
  elements, compounds, molecules, reactions, materials, discoveries, nobelPrizes };
