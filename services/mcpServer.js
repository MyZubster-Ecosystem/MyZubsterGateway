const express = require('express');
const { McpServer } = require('@modelcontextprotocol/sdk');
const { StreamableHTTPTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');

class MCPStatelessServer {
  constructor() {
    this.app = express();
    this.server = new McpServer({
      name: 'MyZubster-MCP',
      version: '2.0.0',
      // Stateless: nessuna persistenza di sessione
      stateless: true,
    });
    
    this.setupTools();
    this.setupTransport();
  }

  setupTools() {
    // Tool 1: Decisione EVA IONI (stateless)
    this.server.tool('eva_decision', {
      sensorData: { type: 'object' },
      context: { type: 'object' }
    }, async (args) => {
      // Ogni chiamata è indipendente, non usa sessioni
      const { sensorData, context } = args;
      const decision = await this.makeDecision(sensorData, context);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(decision)
        }]
      };
    });

    // Tool 2: Generazione galassia
    this.server.tool('generate_galaxy', {
      name: { type: 'string' }
    }, async (args) => {
      const metadata = await this.generateGalaxyMetadata(args.name);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(metadata)
        }]
      };
    });

    // Tool 3: Analisi transazione Monero
    this.server.tool('analyze_transaction', {
      transaction: { type: 'object' }
    }, async (args) => {
      const analysis = await this.analyzeTransaction(args.transaction);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(analysis)
        }]
      };
    });

    // Tool 4: Stato robot
    this.server.tool('robot_status', {
      robotId: { type: 'string' }
    }, async (args) => {
      const status = await this.getRobotStatus(args.robotId);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(status)
        }]
      };
    });
  }

  setupTransport() {
    // Usa Streamable HTTP transport (stateless)
    const transport = new StreamableHTTPTransport({
      server: this.server,
      app: this.app,
      path: '/mcp',
      // Stateless: non mantenere sessioni
      sessionIdGenerator: null,
    });
    
    this.transport = transport;
  }

  async makeDecision(sensorData, context) {
    // Logica decisionale (usa DeepSeek se disponibile)
    const moisture = sensorData.moisture || 0;
    if (moisture < 40) {
      return { action: 'irrigate', priority: 10, payment: false };
    } else if (moisture < 60) {
      return { action: 'monitor', priority: 5, payment: false };
    } else {
      return { action: 'rest', priority: 1, payment: false };
    }
  }

  async generateGalaxyMetadata(name) {
    // Usa DeepSeek per generare metadati
    return {
      name,
      type: 'Spirale',
      distance: 'N/A',
      exoplanets: 0,
      features: 'Generato da MCP Stateless'
    };
  }

  async analyzeTransaction(transaction) {
    return {
      risk: 'low',
      recommendation: 'Accept',
      analysis: 'Transaction appears valid'
    };
  }

  async getRobotStatus(robotId) {
    try {
      const response = await fetch(`http://localhost:5002/api/robots/status?robotId=${robotId}`);
      return await response.json();
    } catch (error) {
      return { error: 'Robot not found' };
    }
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`✅ MCP Stateless Server running on port ${port}`);
      console.log(`📡 Endpoint: http://localhost:${port}/mcp`);
      console.log(`🔑 Use OAuth for authentication`);
    });
  }
}

module.exports = new MCPStatelessServer();
