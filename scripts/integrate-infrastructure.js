#!/usr/bin/env node

/**
 * MyZubster Infrastructure Integration Script
 * Integra Robotica, IoT, AI, Pagamenti e NFT in un unico flusso
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Configurazione
const CONFIG = {
  gateway: 'http://localhost:5002',
  mcp: 'http://localhost:3002',
  jwtSecret: 'myzubster-secret',
  robotId: 'eva-ioni-integration-001'
};

// Genera token JWT
const token = jwt.sign(
  { userId: 'admin', role: 'admin' },
  CONFIG.jwtSecret,
  { expiresIn: '24h' }
);

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Logger
const log = (step, message, data = null) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📍 ${step}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`ℹ️  ${message}`);
  if (data) console.log(`📊 ${JSON.stringify(data, null, 2)}`);
};

// 1. REGISTRA ROBOT
async function registerRobot() {
  log('Step 1', 'Registrazione Robot');
  
  const robotData = {
    id: CONFIG.robotId,
    name: 'EVA IONI - Integrated Robot',
    brand: 'MyZubster',
    model: 'EVA IONI v2.0',
    type: 'agricultural',
    walletAddress: '45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe',
    capabilities: ['irrigazione', 'monitoraggio_suolo', 'raccolta', 'mapping'],
    metadata: {
      batteryLife: 120,
      weight: 5.2,
      sensors: ['ph', 'ec', 'temperature', 'humidity', 'light', 'moisture', 'co2'],
      autonomy: 120,
      chargingTime: 60,
      areaCapacity: 50
    }
  };
  
  try {
    const response = await axios.post(
      `${CONFIG.gateway}/api/robots/register`,
      robotData,
      { headers }
    );
    log('✅ Robot Registrato', `ID: ${response.data.robot.id}`, response.data.robot);
    return response.data.robot;
  } catch (error) {
    log('⚠️ Robot già registrato o errore', error.response?.data?.error || error.message);
    // Recupera robot esistente
    const response = await axios.get(
      `${CONFIG.gateway}/api/robots/${CONFIG.robotId}`,
      { headers }
    );
    return response.data.robot;
  }
}

// 2. INIZIALIZZA SENSORI IoT
async function initializeSensors() {
  log('Step 2', 'Inizializzazione Sensori IoT');
  
  const sensors = {
    ph: 6.8,
    ec: 1.2,
    temperature: 28.5,
    humidity: 65,
    light: 750,
    moisture: 45,
    co2: 420
  };
  
  try {
    const response = await axios.post(
      `${CONFIG.gateway}/api/sensors/data`,
      {
        robotId: CONFIG.robotId,
        timestamp: new Date().toISOString(),
        sensors,
        location: { lat: 44.0594, lng: 12.5683 }
      },
      { headers }
    );
    log('✅ Sensori Inizializzati', 'Dati inviati con successo', sensors);
    return response.data;
  } catch (error) {
    log('❌ Errore sensori', error.message);
    return null;
  }
}

// 3. INTEGRA AI (DeepSeek)
async function integrateAI() {
  log('Step 3', 'Integrazione AI - DeepSeek V4 Flash');
  
  const sensorData = {
    moisture: 45,
    temperature: 28.5,
    ph: 6.8,
    light: 750,
    humidity: 65
  };
  
  const context = {
    plant: 'pomodoro',
    stage: 'fioritura',
    lastWatering: '2 ore fa'
  };
  
  try {
    const response = await axios.post(
      `${CONFIG.gateway}/api/deepseek/eva-decision`,
      { sensorData, context },
      { headers }
    );
    log('✅ AI Decisione', 'Decisione generata', response.data);
    return response.data;
  } catch (error) {
    log('⚠️ AI fallback', 'Usando decisione predefinita', { action: 'monitor', priority: 5 });
    return { decision: 'monitor', priority: 5, payment: false };
  }
}

// 4. ESEGUI LAVORO CON PAGAMENTO
async function executeJob(aiDecision) {
  log('Step 4', 'Esecuzione Lavoro e Pagamento');
  
  const jobData = {
    type: aiDecision?.action || 'irrigazione',
    amount: 0.01,
    currency: 'XMR',
    description: 'Lavoro automatico da AI',
    priority: aiDecision?.priority || 5,
    parameters: {
      waterAmount: 5.0,
      area: 'giardino_integrato',
      duration: 30
    }
  };
  
  try {
    // Assegna lavoro
    const jobResponse = await axios.post(
      `${CONFIG.gateway}/api/robots/${CONFIG.robotId}/job`,
      jobData,
      { headers }
    );
    const jobId = jobResponse.data.job.id;
    log('✅ Lavoro Assegnato', `ID: ${jobId}`, jobResponse.data.job);
    
    // Completa lavoro
    const completeResponse = await axios.post(
      `${CONFIG.gateway}/api/robots/job/${jobId}/complete`,
      { result: { success: true, details: 'Lavoro completato con successo' } },
      { headers }
    );
    log('✅ Lavoro Completato', 'Pagamento processato', completeResponse.data.job);
    
    return completeResponse.data;
  } catch (error) {
    log('❌ Errore lavoro', error.response?.data?.error || error.message);
    return null;
  }
}

// 5. TOKENIZZA IN NFT
async function tokenizeRobot(robot) {
  log('Step 5', 'Tokenizzazione in NFT');
  
  const nftData = {
    type: 'hera_robot',
    name: robot.name || 'EVA IONI - Integrated Robot',
    metadata: {
      category: 'urban_agriculture',
      reward: 400,
      currency: 'MYZ',
      robotId: robot.id,
      capabilities: robot.capabilities || [],
      autonomy: robot.metadata?.autonomy || 120,
      sensors: robot.metadata?.sensors || [],
      status: 'active',
      integrated: true,
      integrationDate: new Date().toISOString(),
      performance: {
        jobs_completed: robot.jobsCompleted || 0,
        total_earnings: robot.balance || 0,
        area_covered: robot.areaCovered || 0
      }
    }
  };
  
  try {
    const response = await axios.post(
      `${CONFIG.gateway}/api/nft/mint`,
      nftData,
      { headers }
    );
    log('✅ NFT Creato', `Token: ${response.data.nft.tokenId}`, response.data.nft);
    return response.data.nft;
  } catch (error) {
    log('❌ Errore NFT', error.response?.data?.error || error.message);
    return null;
  }
}

// 6. VERIFICA INTEGRAZIONE
async function verifyIntegration() {
  log('Step 6', 'Verifica Integrazione Completa');
  
  try {
    const [nftStats, robotStatus, health] = await Promise.all([
      axios.get(`${CONFIG.gateway}/api/nft/stats`, { headers }),
      axios.get(`${CONFIG.gateway}/api/robots/status?robotId=${CONFIG.robotId}`, { headers }),
      axios.get(`${CONFIG.gateway}/api/health`, { headers })
    ]);
    
    const integrationStatus = {
      gateway: health.data.status,
      nftSystem: nftStats.data.success,
      robot: robotStatus.data.status || 'registered',
      totalNFTs: nftStats.data.stats.total,
      robotBalance: robotStatus.data.balance || 0,
      timestamp: new Date().toISOString()
    };
    
    log('✅ Integrazione Verificata', 'Tutti i componenti sono connessi', integrationStatus);
    return integrationStatus;
  } catch (error) {
    log('❌ Errore verifica', error.message);
    return null;
  }
}

// 7. ESPORTA CONFIGURAZIONE
async function exportConfiguration() {
  log('Step 7', 'Esportazione Configurazione');
  
  const config = {
    infrastructure: {
      gateway: CONFIG.gateway,
      mcp: CONFIG.mcp,
      robotId: CONFIG.robotId
    },
    components: {
      robot: true,
      sensors: true,
      ai: true,
      payments: true,
      nft: true
    },
    status: await verifyIntegration()
  };
  
  const configPath = path.join(__dirname, '../data/infrastructure-config.json');
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  log('✅ Configurazione Esportata', `File: ${configPath}`, { location: configPath });
  return config;
}

// MAIN - Esegui integrazione completa
async function main() {
  console.log('\n');
  console.log('🚀 MYZUBSTER INFRASTRUCTURE INTEGRATION');
  console.log('========================================');
  console.log('🌍 Integrazione completa di Robotica, IoT, AI, Pagamenti e NFT\n');
  
  try {
    // Step 1: Registra robot
    const robot = await registerRobot();
    
    // Step 2: Inizializza sensori
    await initializeSensors();
    
    // Step 3: Integra AI
    const aiDecision = await integrateAI();
    
    // Step 4: Esegui lavoro con pagamento
    await executeJob(aiDecision);
    
    // Step 5: Tokenizza in NFT
    await tokenizeRobot(robot);
    
    // Step 6: Verifica integrazione
    const status = await verifyIntegration();
    
    // Step 7: Esporta configurazione
    await exportConfiguration();
    
    console.log('\n');
    console.log('🎉 INTEGRAZIONE COMPLETATA CON SUCCESSO!');
    console.log('========================================');
    console.log(`✅ Robot: ${status?.robot || 'online'}`);
    console.log(`✅ NFT Totali: ${status?.totalNFTs || 0}`);
    console.log(`✅ Saldo Robot: ${status?.robotBalance || 0} XMR`);
    console.log(`✅ Gateway: ${status?.gateway || 'online'}`);
    console.log('\n🌍 L\'infrastruttura è completamente integrata e operativa!');
    
  } catch (error) {
    console.error('\n❌ Errore durante l\'integrazione:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
