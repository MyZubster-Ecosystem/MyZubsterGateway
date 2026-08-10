#!/usr/bin/env node

const axios = require('axios');
const jwt = require('jsonwebtoken');

const GATEWAY = 'http://localhost:5002';
const JWT_SECRET = 'myzubster-secret';

const token = jwt.sign(
  { userId: 'admin', role: 'admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

const nfts = [
  // HERA ROBOT (8)
  { type: 'hera_robot', name: 'EVA IONI - Agricultural Robot', metadata: { category: 'urban_agriculture', reward: 400 } },
  { type: 'hera_robot', name: 'Hera-Scout - Inspection Robot', metadata: { category: 'urban_inspection', reward: 350 } },
  { type: 'hera_robot', name: 'Hera-Weeder - Weeding Robot', metadata: { category: 'urban_weeding', reward: 300 } },
  { type: 'hera_robot', name: 'Hera-Pollinator - Pollination Robot', metadata: { category: 'urban_pollination', reward: 450 } },
  { type: 'hera_robot', name: 'Hera-Planter - Planting Robot', metadata: { category: 'urban_planting', reward: 350 } },
  { type: 'hera_robot', name: 'Hera-Harvester - Harvesting Robot', metadata: { category: 'urban_harvesting', reward: 450 } },
  { type: 'hera_robot', name: 'Hera-Monitor - Advanced Monitor Robot', metadata: { category: 'urban_monitoring', reward: 500 } },
  { type: 'hera_robot', name: 'Hera-Trimmer - Trimming Robot', metadata: { category: 'urban_trimming', reward: 400 } },
  // WASTE ROBOT (5)
  { type: 'waste_robot', name: 'Waste-Recycler - Recycling Robot', metadata: { category: 'waste_recycling', reward: 500 } },
  { type: 'waste_robot', name: 'Bin-Emptier - Bin Emptying Robot', metadata: { category: 'waste_emptying', reward: 400 } },
  { type: 'waste_robot', name: 'Bulk-Remover - Bulk Waste Removal Robot', metadata: { category: 'waste_bulk', reward: 600 } },
  { type: 'waste_robot', name: 'Smart-Sorter - AI Waste Sorter', metadata: { category: 'waste_sorting', reward: 550 } },
  { type: 'waste_robot', name: 'Eco-Mapper - Waste Mapping Robot', metadata: { category: 'waste_mapping', reward: 350 } },
  // RESOURCES (3)
  { type: 'resource', name: 'Platino - Cintura Asteroidi', metadata: { category: 'mineral', quantity: '5000 kg', value: '2500 MYZ' } },
  { type: 'resource', name: 'Metano - Titano', metadata: { category: 'gas', quantity: '10000 litri', value: '1000 MYZ' } },
  { type: 'resource', name: 'Acqua - Polo Sud Lunare', metadata: { category: 'water', quantity: '10000 litri', value: '500 MYZ' } }
];

async function restoreNFTs() {
  console.log('🪙 RESTAURO NFT...');
  console.log(`📊 Totale NFT da ricreare: ${nfts.length}`);
  console.log('');
  
  let success = 0;
  
  for (const nft of nfts) {
    try {
      const response = await axios.post(
        `${GATEWAY}/api/nft/mint`,
        nft,
        { headers }
      );
      console.log(`✅ ${nft.name} → ${response.data.nft.tokenId}`);
      success++;
    } catch (error) {
      console.error(`❌ Errore per ${nft.name}:`, error.response?.data?.error || error.message);
    }
  }
  
  console.log('');
  console.log(`✅ NFT restaurati: ${success}/${nfts.length}`);
}

restoreNFTs();
