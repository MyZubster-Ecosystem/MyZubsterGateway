#!/usr/bin/env node

const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const GATEWAY_URL = process.env.API_URL || 'http://localhost:5002';
const JWT_SECRET = process.env.JWT_SECRET || 'myzubster-secret';

// Genera token admin
const adminToken = jwt.sign(
  { userId: 'admin', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Lista di oggetti cosmici da tokenizzare
const cosmicObjects = {
  galaxies: [
    { name: 'Via Lattea', type: 'Spirale barrata', distanceLy: '0', features: 'Casa del Sistema Solare' },
    { name: 'Andromeda', type: 'Spirale gigante', distanceLy: '2.537 milioni', features: 'Si scontrerà con la Via Lattea' },
    { name: 'Triangolo', type: 'Spirale', distanceLy: '2.7 milioni', features: 'Membro del Gruppo Locale' },
    { name: 'Sombrero', type: 'Spirale', distanceLy: '29 milioni', features: 'Galassia con alone brillante' },
    { name: 'Bode', type: 'Spirale', distanceLy: '12 milioni', features: 'Visibile con telescopio amatoriale' }
  ],
  stars: [
    { name: 'Sole', type: 'Nana Gialla', constellation: 'N/A', magnitude: '-26.74' },
    { name: 'Sirio', type: 'Nana Bianca', constellation: 'Cane Maggiore', magnitude: '-1.46' },
    { name: 'Betelgeuse', type: 'Supergigante Rossa', constellation: 'Orione', magnitude: '0.5' },
    { name: 'Rigel', type: 'Supergigante Blu', constellation: 'Orione', magnitude: '0.13' },
    { name: 'Alpha Centauri', type: 'Nana Gialla', constellation: 'Centauro', magnitude: '-0.27' },
    { name: 'Polaris', type: 'Supergigante Gialla', constellation: 'Orsa Minore', magnitude: '1.98' },
    { name: 'Vega', type: 'Nana Bianca', constellation: 'Lira', magnitude: '0.03' }
  ],
  planets: [
    { name: 'Terra', type: 'Roccioso', starSystem: 'Sistema Solare', habitability: '✅ Abitabile' },
    { name: 'Marte', type: 'Roccioso', starSystem: 'Sistema Solare', habitability: '🟡 Potenzialmente abitabile' },
    { name: 'Venere', type: 'Roccioso', starSystem: 'Sistema Solare', habitability: '❌ Inabitabile' },
    { name: 'Kepler-452b', type: 'Super-Terra', starSystem: 'Kepler-452', habitability: '🔵 Zona abitabile' },
    { name: 'Proxima Centauri b', type: 'Roccioso', starSystem: 'Proxima Centauri', habitability: '🔵 Zona abitabile' },
    { name: 'TRAPPIST-1e', type: 'Roccioso', starSystem: 'TRAPPIST-1', habitability: '🔵 Zona abitabile' },
    { name: 'HD 40307g', type: 'Super-Terra', starSystem: 'HD 40307', habitability: '🔵 Zona abitabile' }
  ],
  constellations: [
    { name: 'Orione', abbreviation: 'Ori', hemisphere: 'Nord', mythology: 'Il cacciatore' },
    { name: 'Andromeda', abbreviation: 'And', hemisphere: 'Nord', mythology: 'La principessa' },
    { name: 'Grande Carro', abbreviation: 'UMa', hemisphere: 'Nord', mythology: 'L\'orsa maggiore' },
    { name: 'Cigno', abbreviation: 'Cyg', hemisphere: 'Nord', mythology: 'Il cigno' },
    { name: 'Sagittario', abbreviation: 'Sgr', hemisphere: 'Sud', mythology: 'Il centauro arciere' }
  ],
  nebulae: [
    { name: 'Nebulosa di Orione', type: 'Nebulosa Diffusa', distanceLy: '1.344', constellation: 'Orione' },
    { name: 'Nebulosa Anello', type: 'Nebulosa Planetaria', distanceLy: '2.280', constellation: 'Lira' },
    { name: 'Nebulosa Helix', type: 'Nebulosa Planetaria', distanceLy: '650', constellation: 'Acquario' },
    { name: 'Nebulosa Aquila', type: 'Nebulosa Diffusa', distanceLy: '7.000', constellation: 'Serpente' },
    { name: 'Nebulosa Laguna', type: 'Nebulosa Diffusa', distanceLy: '5.200', constellation: 'Sagittario' }
  ]
};

// Funzione per generare metadati con DeepSeek
async function generateMetadata(objectName, objectType) {
  try {
    const response = await axios.post(
      `${GATEWAY_URL}/api/deepseek/generate-galaxy`,
      { name: objectName },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data.galaxy;
  } catch (error) {
    console.log(`   ⚠️ DeepSeek non disponibile per ${objectName}, uso metadati di base`);
    return null;
  }
}

// Funzione per mintare un oggetto
async function mintObject(object, type, endpoint) {
  try {
    const response = await axios.post(
      `${GATEWAY_URL}/api/nft/${endpoint}`,
      object,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`   ❌ Errore per ${object.name}:`, error.response?.data?.error || error.message);
    return null;
  }
}

// Tokenizza una categoria
async function tokenizeCategory(objects, type, endpoint) {
  console.log(`\n📡 Tokenizzazione ${type}...`);
  let count = 0;
  
  for (const obj of objects) {
    console.log(`   🌟 ${obj.name}...`);
    
    // Genera metadati con DeepSeek
    const metadata = await generateMetadata(obj.name, type);
    if (metadata) {
      console.log(`      ✅ Metadati generati da DeepSeek`);
    }
    
    const result = await mintObject(obj, type, endpoint);
    if (result) {
      count++;
      console.log(`      ✅ Tokenizzato: ${result.nft?.tokenId || 'OK'}`);
    }
  }
  
  console.log(`   ✅ ${count}/${objects.length} ${type} tokenizzati`);
  return count;
}

// Esegui la tokenizzazione
async function main() {
  console.log('🌌 TOKENIZZAZIONE DELL\'UNIVERSO');
  console.log('================================');
  console.log(`📊 Oggetti totali: ${Object.values(cosmicObjects).reduce((sum, arr) => sum + arr.length, 0)}`);
  console.log('');
  
  let totalMinted = 0;
  
  // Tokenizza galassie
  totalMinted += await tokenizeCategory(cosmicObjects.galaxies, 'Galassie', 'galaxy/mint');
  
  // Tokenizza stelle
  totalMinted += await tokenizeCategory(cosmicObjects.stars, 'Stelle', 'star/mint');
  
  // Tokenizza pianeti
  totalMinted += await tokenizeCategory(cosmicObjects.planets, 'Pianeti', 'planet/mint');
  
  // Tokenizza costellazioni
  totalMinted += await tokenizeCategory(cosmicObjects.constellations, 'Costellazioni', 'constellation/mint');
  
  // Tokenizza nebulose
  totalMinted += await tokenizeCategory(cosmicObjects.nebulae, 'Nebulose', 'nebula/mint');
  
  console.log('\n📊 RIEPILOGO UNIVERSO TOKENIZZATO');
  console.log('================================');
  console.log(`✅ Totale oggetti tokenizzati: ${totalMinted}`);
  console.log('🎉 L\'universo è ora sulla blockchain!');
}

main().catch(console.error);
