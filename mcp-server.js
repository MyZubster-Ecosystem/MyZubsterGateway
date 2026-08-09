#!/usr/bin/env node
const express = require('express');
const app = express();
app.use(express.json());

console.log('🚀 MCP Stateless Server avviato su porta 3003');
console.log('📡 Endpoint: http://localhost:3003/mcp');

// Mock dei tool MCP
app.post('/mcp', (req, res) => {
  const { method, params } = req.body;
  
  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};
    
    let result = {};
    
    switch(toolName) {
      case 'eva_decision':
        const moisture = args.sensorData?.moisture || 45;
        result = {
          action: moisture < 40 ? 'irrigate' : 'monitor',
          priority: moisture < 40 ? 10 : 5,
          payment: moisture < 40
        };
        break;
      case 'generate_galaxy':
        result = {
          name: args.name || 'Andromeda',
          type: 'Spirale gigante',
          distance: '2.537 milioni anni luce',
          exoplanets: 1,
          features: 'Buco nero centrale'
        };
        break;
      case 'analyze_transaction':
        result = {
          risk: 'low',
          recommendation: 'Accept',
          analysis: 'Transazione valida'
        };
        break;
      case 'robot_status':
        result = {
          robotId: args.robotId || 'eva-ioni-001',
          status: 'online',
          balance: 0.5
        };
        break;
      default:
        result = { error: 'Tool not found' };
    }
    
    res.json({
      jsonrpc: '2.0',
      result: {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      },
      id: req.body.id || 1
    });
  } else {
    res.status(400).json({ error: 'Method not supported' });
  }
});

const PORT = process.env.MCP_PORT || 3003;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MCP Server running on port ${PORT}`);
});
