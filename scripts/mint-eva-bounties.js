#!/usr/bin/env node

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

// Configurazione
const GATEWAY_URL = process.env.API_URL || 'http://localhost:5002';
const JWT_SECRET = process.env.JWT_SECRET || 'myzubster-secret';

// Bounty EVA IONI da mintare
const evaBounties = [
  {
    id: 1049,
    name: 'IoT Sensor Integration',
    type: 'IoT',
    reward: 250,
    contributor: 'EVA IONI',
    wallet: '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe'
  },
  {
    id: 1050,
    name: 'Fiat Payments',
    type: 'Payments',
    reward: 300,
    contributor: 'EVA IONI',
    wallet: '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe'
  },
  {
    id: 1051,
    name: 'Multi-Currency Crypto',
    type: 'Crypto',
    reward: 350,
    contributor: 'EVA IONI',
    wallet: '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe'
  },
  {
    id: 1052,
    name: 'EVA IONI Arm Prototype',
    type: 'Robotics',
    reward: 400,
    contributor: 'EVA IONI',
    wallet: '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe'
  },
  {
    id: 1053,
    name: 'Mobile App',
    type: 'Mobile',
    reward: 500,
    contributor: 'EVA IONI',
    wallet: '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe'
  },
  {
    id: 1064,
    name: 'Telegram Bot Fix',
    type: 'Bot',
    reward: 200,
    contributor: 'EVA IONI',
    wallet: '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe',
    lifetimeBonus: '1%'
  },
  {
    id: 1065,
    name: 'Marketplace Fix',
    type: 'Marketplace',
    reward: 150,
    contributor: 'EVA IONI',
    wallet: '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe',
    lifetimeBonus: '1%'
  }
];

// Genera token JWT per le operazioni admin
const adminToken = jwt.sign(
  { userId: 'admin', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Funzione per mintare un token
async function mintBounty(bounty) {
  try {
    console.log(`\n🪙 Minting bounty #${bounty.id}: ${bounty.name}...`);
    
    // Crea l'NFT del bounty
    const response = await axios.post(
      `${GATEWAY_URL}/api/nft/bounty/mint`,
      {
        bountyId: bounty.id,
        name: bounty.name,
        type: bounty.type,
        reward: bounty.reward,
        contributor: bounty.contributor,
        wallet: bounty.wallet,
        lifetimeBonus: bounty.lifetimeBonus || null
      },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ Bounty #${bounty.id} mintato!`);
    console.log(`   NFT: ${response.data.nft.tokenId}`);
    console.log(`   Reward: ${bounty.reward} MYZ`);
    console.log(`   Wallet: ${bounty.wallet}`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Errore per bounty #${bounty.id}:`, error.response?.data?.error || error.message);
    return null;
  }
}

// Esegui il minting
async function main() {
  console.log('🚀 INIZIO MINTING BOUNTY EVA IONI');
  console.log('================================');
  console.log(`📊 Totale bounty da mintare: ${evaBounties.length}`);
  console.log(`💰 Totale MYZ da distribuire: ${evaBounties.reduce((sum, b) => sum + b.reward, 0)} MYZ`);
  console.log('');
  
  let successCount = 0;
  let totalMYZ = 0;
  
  for (const bounty of evaBounties) {
    const result = await mintBounty(bounty);
    if (result) {
      successCount++;
      totalMYZ += bounty.reward;
    }
  }
  
  console.log('\n📊 RIEPILOGO MINTING');
  console.log('================================');
  console.log(`✅ Bounty mintati: ${successCount}/${evaBounties.length}`);
  console.log(`💰 Totale MYZ distribuiti: ${totalMYZ} MYZ`);
  console.log('🎉 Processo completato!');
}

main().catch(console.error);
