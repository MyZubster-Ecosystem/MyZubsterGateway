const fs = require('fs');
const path = require('path');

const NFT_DB = path.join(__dirname, '../data/nfts.json');

// Carica i dati
let db = { nfts: [] };
try {
  if (fs.existsSync(NFT_DB)) {
    db = JSON.parse(fs.readFileSync(NFT_DB, 'utf8'));
  }
} catch(e) {
  console.error('Errore caricamento:', e.message);
}

// Lista oggetti universo da creare
const universeObjects = [
  { type: 'universe_galaxy', name: '🌌 Galassia Andromeda' },
  { type: 'universe_galaxy', name: '🌌 Galassia Via Lattea' },
  { type: 'universe_galaxy', name: '🌌 Galassia Triangolo' },
  { type: 'universe_galaxy', name: '🌌 Galassia Sombrero' },
  { type: 'universe_galaxy', name: '🌌 Galassia Whirlpool' },
  { type: 'universe_star', name: '⭐ Stella Sole' },
  { type: 'universe_star', name: '⭐ Stella Sirio' },
  { type: 'universe_star', name: '⭐ Stella Betelgeuse' },
  { type: 'universe_star', name: '⭐ Stella Polaris' },
  { type: 'universe_star', name: '⭐ Stella Alpha Centauri' },
  { type: 'universe_planet', name: '🌍 Pianeta Terra' },
  { type: 'universe_planet', name: '🌍 Pianeta Marte' },
  { type: 'universe_planet', name: '🌍 Pianeta Giove' },
  { type: 'universe_planet', name: '🌍 Pianeta Saturno' },
  { type: 'universe_planet', name: '🌍 Pianeta Kepler-452b' },
  { type: 'universe_nebula', name: '🌌 Nebulosa Orione' },
  { type: 'universe_nebula', name: '🌌 Nebulosa Granchio' },
  { type: 'universe_nebula', name: '🌌 Nebulosa Laguna' },
  { type: 'universe_blackhole', name: '🌀 Buco Nero Sagittarius A*' },
  { type: 'universe_blackhole', name: '🌀 Buco Nero M87*' },
  { type: 'universe_constellation', name: '⭐ Costellazione Orsa Maggiore' },
  { type: 'universe_constellation', name: '⭐ Costellazione Orione' },
  { type: 'universe_constellation', name: '⭐ Costellazione Cassiopeia' }
];

// Aggiungi NFT
let created = 0;
universeObjects.forEach(function(obj) {
  // Verifica se esiste già
  let exists = false;
  for (let i = 0; i < db.nfts.length; i++) {
    if (db.nfts[i].name === obj.name) {
      exists = true;
      break;
    }
  }
  
  if (!exists) {
    const tokenId = 'NFT-' + String(db.nfts.length + 1).padStart(6, '0');
    db.nfts.push({
      tokenId: tokenId,
      type: obj.type,
      name: obj.name,
      metadata: {
        category: obj.type.replace('universe_', ''),
        tokenized: true,
        date: '2026-08-09',
        blockchain: 'MyZubster Chain'
      },
      owner: 'cosmic-explorer',
      mintedAt: new Date().toISOString(),
      blockchain: 'MyZubster Chain'
    });
    created++;
  }
});

// Salva
fs.writeFileSync(NFT_DB, JSON.stringify(db, null, 2));
console.log('✅ NFT Universo creati:', created);
console.log('📊 NFT Totali:', db.nfts.length);

// Statistiche per tipo
const stats = {};
db.nfts.forEach(function(nft) {
  stats[nft.type] = (stats[nft.type] || 0) + 1;
});
console.log('📊 Statistiche:', stats);
