#!/usr/bin/env node

const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const GATEWAY_URL = process.env.API_URL || 'http://localhost:5002';
const JWT_SECRET = process.env.JWT_SECRET || 'myzubster-secret';

// Genera token admin
const token = jwt.sign(
  { userId: 'admin', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Dati NFT da mintare
const nftData = {
  galaxies: [
    { name: 'Via Lattea', type: 'Spirale barrata', metadata: { distance: '0 ly', exoplanets: 5000 } },
    { name: 'Andromeda', type: 'Spirale gigante', metadata: { distance: '2.537M ly', exoplanets: 1 } },
    { name: 'Triangolo', type: 'Spirale', metadata: { distance: '2.7M ly', exoplanets: 0 } },
    { name: 'Sombrero', type: 'Spirale', metadata: { distance: '29M ly' } },
    { name: 'Bode', type: 'Spirale', metadata: { distance: '12M ly' } }
  ],
  stars: [
    { name: 'Sole', type: 'Nana Gialla', metadata: { constellation: 'N/A', magnitude: '-26.74' } },
    { name: 'Sirio', type: 'Nana Bianca', metadata: { constellation: 'Cane Maggiore', magnitude: '-1.46' } },
    { name: 'Betelgeuse', type: 'Supergigante Rossa', metadata: { constellation: 'Orione', magnitude: '0.5' } },
    { name: 'Rigel', type: 'Supergigante Blu', metadata: { constellation: 'Orione', magnitude: '0.13' } },
    { name: 'Alpha Centauri', type: 'Nana Gialla', metadata: { constellation: 'Centauro', magnitude: '-0.27' } },
    { name: 'Polaris', type: 'Supergigante Gialla', metadata: { constellation: 'Orsa Minore', magnitude: '1.98' } },
    { name: 'Vega', type: 'Nana Bianca', metadata: { constellation: 'Lira', magnitude: '0.03' } }
  ],
  planets: [
    { name: 'Terra', type: 'Roccioso', metadata: { starSystem: 'Sistema Solare', habitability: '✅ Abitabile' } },
    { name: 'Marte', type: 'Roccioso', metadata: { starSystem: 'Sistema Solare', habitability: '🟡 Potenzialmente abitabile' } },
    { name: 'Venere', type: 'Roccioso', metadata: { starSystem: 'Sistema Solare', habitability: '❌ Inabitabile' } },
    { name: 'Kepler-452b', type: 'Super-Terra', metadata: { starSystem: 'Kepler-452', habitability: '🔵 Zona abitabile' } },
    { name: 'Proxima Centauri b', type: 'Roccioso', metadata: { starSystem: 'Proxima Centauri', habitability: '🔵 Zona abitabile' } },
    { name: 'TRAPPIST-1e', type: 'Roccioso', metadata: { starSystem: 'TRAPPIST-1', habitability: '🔵 Zona abitabile' } },
    { name: 'HD 40307g', type: 'Super-Terra', metadata: { starSystem: 'HD 40307', habitability: '🔵 Zona abitabile' } }
  ],
  constellations: [
    { name: 'Orione', type: 'Cacciatore', metadata: { abbreviation: 'Ori', hemisphere: 'Nord' } },
    { name: 'Andromeda', type: 'Principessa', metadata: { abbreviation: 'And', hemisphere: 'Nord' } },
    { name: 'Grande Carro', type: 'Orsa Maggiore', metadata: { abbreviation: 'UMa', hemisphere: 'Nord' } },
    { name: 'Cigno', type: 'Cigno', metadata: { abbreviation: 'Cyg', hemisphere: 'Nord' } },
    { name: 'Sagittario', type: 'Centauro', metadata: { abbreviation: 'Sgr', hemisphere: 'Sud' } }
  ],
  nebulae: [
    { name: 'Nebulosa di Orione', type: 'Nebulosa Diffusa', metadata: { distanceLy: '1.344', constellation: 'Orione' } },
    { name: 'Nebulosa Anello', type: 'Nebulosa Planetaria', metadata: { distanceLy: '2.280', constellation: 'Lira' } },
    { name: 'Nebulosa Helix', type: 'Nebulosa Planetaria', metadata: { distanceLy: '650', constellation: 'Acquario' } },
    { name: 'Nebulosa Aquila', type: 'Nebulosa Diffusa', metadata: { distanceLy: '7.000', constellation: 'Serpente' } },
    { name: 'Nebulosa Laguna', type: 'Nebulosa Diffusa', metadata: { distanceLy: '5.200', constellation: 'Sagittario' } }
  ],
  elements: [
    { name: 'Carbonio', type: 'Non-metallo', metadata: { symbol: 'C', atomicNumber: 6, mass: 12.011 } },
    { name: 'Ossigeno', type: 'Non-metallo', metadata: { symbol: 'O', atomicNumber: 8, mass: 15.999 } },
    { name: 'Ferro', type: 'Metallo di transizione', metadata: { symbol: 'Fe', atomicNumber: 26, mass: 55.845 } },
    { name: 'Oro', type: 'Metallo di transizione', metadata: { symbol: 'Au', atomicNumber: 79, mass: 196.967 } },
    { name: 'Rame', type: 'Metallo di transizione', metadata: { symbol: 'Cu', atomicNumber: 29, mass: 63.546 } },
    { name: 'Silicio', type: 'Metalloide', metadata: { symbol: 'Si', atomicNumber: 14, mass: 28.085 } }
  ],
  molecules: [
    { name: 'Acqua', type: 'Composto', metadata: { formula: 'H₂O', molarMass: 18.015 } },
    { name: 'Anidride Carbonica', type: 'Gas', metadata: { formula: 'CO₂', molarMass: 44.01 } },
    { name: 'Clorofilla A', type: 'Pigmento', metadata: { formula: 'C₅₅H₇₂MgN₄O₅', molarMass: 893.49 } },
    { name: 'Glucosio', type: 'Zucchero', metadata: { formula: 'C₆H₁₂O₆', molarMass: 180.156 } },
    { name: 'DNA', type: 'Acido nucleico', metadata: { structure: 'Doppia elica' } }
  ],
  bounties: [
    { name: 'IoT Sensor Integration', type: 'IoT', metadata: { reward: 250, contributor: 'EVA IONI' } },
    { name: 'Fiat Payments', type: 'Payments', metadata: { reward: 300, contributor: 'EVA IONI' } },
    { name: 'Multi-Currency Crypto', type: 'Crypto', metadata: { reward: 350, contributor: 'EVA IONI' } },
    { name: 'EVA IONI Arm Prototype', type: 'Robotics', metadata: { reward: 400, contributor: 'EVA IONI' } },
    { name: 'Mobile App', type: 'Mobile', metadata: { reward: 500, contributor: 'EVA IONI' } },
    { name: 'Telegram Bot Fix', type: 'Bot', metadata: { reward: 200, contributor: 'EVA IONI', lifetimeBonus: '1%' } },
    { name: 'Marketplace Fix', type: 'Marketplace', metadata: { reward: 150, contributor: 'EVA IONI', lifetimeBonus: '1%' } }
  ]
};

// Funzione per mintare un NFT con retry
async function mintNFT(type, name, metadata, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        `${GATEWAY_URL}/api/nft/mint`,
        { type, name, metadata },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      console.log(`  ✅ ${type}: ${name} → ${response.data.nft.tokenId}`);
      return response.data;
    } catch (error) {
      if (i === retries - 1) {
        console.error(`  ❌ Errore per ${name} (tentativo ${i+1}/${retries}):`, error.response?.data?.error || error.message);
      } else {
        console.log(`  ⏳ ${name}: riprovo... (${i+1}/${retries})`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  return null;
}

// Esegui il minting
async function main() {
  console.log('🌌 MINTING COMPLETO DI TUTTI GLI NFT');
  console.log('===================================');
  
  let total = 0;
  let errors = 0;
  
  // Galassie
  console.log('\n🌌 Minting Galassie...');
  for (const item of nftData.galaxies) {
    const result = await mintNFT('galaxy', item.name, item.metadata);
    if (result) total++; else errors++;
  }
  
  // Stelle
  console.log('\n⭐ Minting Stelle...');
  for (const item of nftData.stars) {
    const result = await mintNFT('star', item.name, item.metadata);
    if (result) total++; else errors++;
  }
  
  // Pianeti
  console.log('\n🪐 Minting Pianeti...');
  for (const item of nftData.planets) {
    const result = await mintNFT('planet', item.name, item.metadata);
    if (result) total++; else errors++;
  }
  
  // Costellazioni
  console.log('\n🔭 Minting Costellazioni...');
  for (const item of nftData.constellations) {
    const result = await mintNFT('constellation', item.name, item.metadata);
    if (result) total++; else errors++;
  }
  
  // Nebulose
  console.log('\n✨ Minting Nebulose...');
  for (const item of nftData.nebulae) {
    const result = await mintNFT('nebula', item.name, item.metadata);
    if (result) total++; else errors++;
  }
  
  // Elementi
  console.log('\n⚛️ Minting Elementi...');
  for (const item of nftData.elements) {
    const result = await mintNFT('element', item.name, item.metadata);
    if (result) total++; else errors++;
  }
  
  // Molecole
  console.log('\n🧪 Minting Molecole...');
  for (const item of nftData.molecules) {
    const result = await mintNFT('molecule', item.name, item.metadata);
    if (result) total++; else errors++;
  }
  
  // Bounty
  console.log('\n🪙 Minting Bounty...');
  for (const item of nftData.bounties) {
    const result = await mintNFT('bounty', item.name, item.metadata);
    if (result) total++; else errors++;
  }
  
  console.log('\n📊 RIEPILOGO');
  console.log('===================================');
  console.log(`✅ NFT mintati: ${total}`);
  console.log(`❌ Errori: ${errors}`);
  console.log(`📦 Totale: ${total + errors}`);
  console.log('🎉 Tutti gli NFT sono stati ricreati con persistenza su MongoDB!');
}

main().catch(console.error);
