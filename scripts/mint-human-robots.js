#!/usr/bin/env node

const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const GATEWAY_URL = process.env.API_URL || 'http://localhost:5002';
const JWT_SECRET = process.env.JWT_SECRET || 'myzubster-secret';

const token = jwt.sign(
  { userId: 'admin', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

const humanRobots = require('../human-robots/human-robots-tokenization');
const report = humanRobots.generateReport();

const categories = [
  { key: 'androids', label: 'Androidi' },
  { key: 'cyborgs', label: 'Cyborg' },
  { key: 'prosthetics', label: 'Protesi Intelligenti' },
  { key: 'aiAvatars', label: 'AI Avatar' },
  { key: 'companies', label: 'Aziende Produttrici' }
];

async function mintNFT(item, category, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        `${GATEWAY_URL}/api/nft/mint`,
        { type: 'human_robot', name: item.name, metadata: { category, type: item.type, tokenId: item.tokenId } },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      console.log(`  ✅ ${item.name} → ${response.data.nft.tokenId}`);
      return response.data;
    } catch (error) {
      if (i === retries - 1) {
        console.error(`  ❌ Errore per ${item.name} (tentativo ${i + 1}/${retries}):`, error.response?.data?.error || error.message);
      } else {
        console.log(`  ⏳ ${item.name}: riprovo... (${i + 1}/${retries})`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  return null;
}

async function main() {
  console.log('🤖 MINTING ROBOT UMANI — 33 NFT');
  console.log('===================================');

  let total = 0;
  let errors = 0;

  for (const cat of categories) {
    const items = report[cat.key];
    console.log(`\n${cat.label} (${items.length})...`);
    for (const item of items) {
      const result = await mintNFT(item, cat.key);
      if (result) total++;
      else errors++;
    }
  }

  console.log('\n📊 RIEPILOGO');
  console.log('===================================');
  console.log(`✅ NFT mintati: ${total}`);
  console.log(`❌ Errori: ${errors}`);
  console.log(`📦 Totale: ${total + errors}`);
}

main().catch(console.error);
