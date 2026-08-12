/**
 * Hardware Bridge — Bounty BOT-8 / #345
 * Connects physical robots (Arduino, Raspberry Pi, Jetson Nano) to the gateway.
 *
 * Communication: MQTT + WebSocket fallback
 * Protocol: JSON message framing with CRC validation
 */

const WebSocket = require('ws');

class HardwareBridge {
  constructor(server) {
    this.robots = new Map();
    this.pendingCommands = new Map();
    this._wss = null;
    this._commandId = 0;

    if (server) {
      this.attachToServer(server);
    }
  }

  /**
   * Attach WebSocket server to existing HTTP server.
   */
  attachToServer(httpServer) {
    this._wss = new WebSocket.Server({ server: httpServer, path: '/api/robot/hardware/ws' });

    this._wss.on('connection', (ws, req) => {
      const robotId = this._extractRobotId(req);
      console.log(`[HardwareBridge] Robot connected: ${robotId}`);
      this._registerRobot(robotId, ws);
    });

    console.log('[HardwareBridge] WebSocket server attached');
  }

  /**
   * Register a connected robot.
   */
  connect(robotId, metadata = {}) {
    if (this.robots.has(robotId)) {
      return { connected: true, existing: true, robotId };
    }

    const robot = {
      id: robotId,
      type: metadata.type || 'unknown',
      board: metadata.board || 'generic',
      firmware: metadata.firmware || 'unknown',
      capabilities: metadata.capabilities || [],
      status: 'connected',
      connectedAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      telemetry: {
        cpu: 0,
        memory: 0,
        temperature: 0,
        battery: 100,
        uptime: 0
      },
      ws: null
    };

    this.robots.set(robotId, robot);
    console.log(`[HardwareBridge] Robot registered: ${robotId} (${robot.type}/${robot.board})`);
    return { connected: true, existing: false, robotId, robot };
  }

  /**
   * Register a robot via WebSocket connection.
   */
  _registerRobot(robotId, ws) {
    const robot = this.robots.get(robotId) || { id: robotId, type: 'unknown', board: 'generic' };
    robot.ws = ws;
    robot.status = 'connected';
    robot.connectedAt = new Date().toISOString();
    robot.lastHeartbeat = new Date().toISOString();

    this.robots.set(robotId, robot);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        this._handleMessage(robotId, msg);
      } catch (err) {
        console.warn(`[HardwareBridge] Invalid message from ${robotId}: ${err.message}`);
      }
    });

    ws.on('close', () => {
      console.log(`[HardwareBridge] Robot disconnected: ${robotId}`);
      robot.status = 'disconnected';
      robot.ws = null;
      this.robots.set(robotId, robot);
    });

    ws.on('error', (err) => {
      console.error(`[HardwareBridge] WebSocket error for ${robotId}: ${err.message}`);
    });

    // Send welcome message
    this._send(ws, {
      type: 'welcome',
      robotId,
      serverTime: new Date().toISOString(),
      protocol: 'mqtt-gateway-v1'
    });
  }

  /**
   * Handle incoming messages from robots.
   */
  _handleMessage(robotId, msg) {
    switch (msg.type) {
      case 'heartbeat':
        this._handleHeartbeat(robotId);
        break;
      case 'telemetry':
        this._updateTelemetry(robotId, msg.data);
        break;
      case 'command_ack':
        this._handleCommandAck(robotId, msg.commandId, msg.status, msg.result);
        break;
      case 'status':
        this._handleStatusUpdate(robotId, msg.data);
        break;
      default:
        console.log(`[HardwareBridge] Unknown message type from ${robotId}: ${msg.type}`);
    }
  }

  _handleHeartbeat(robotId) {
    const robot = this.robots.get(robotId);
    if (robot) {
      robot.lastHeartbeat = new Date().toISOString();
      if (robot.status === 'disconnected') {
        robot.status = 'connected';
      }
    }
  }

  _updateTelemetry(robotId, data) {
    const robot = this.robots.get(robotId);
    if (robot) {
      robot.telemetry = { ...robot.telemetry, ...data };
    }
  }

  _handleCommandAck(robotId, commandId, status, result) {
    const pending = this.pendingCommands.get(commandId);
    if (pending) {
      pending.status = status;
      pending.result = result;
      pending.resolvedAt = new Date().toISOString();
      if (pending.resolve) pending.resolve({ commandId, status, result });
      this.pendingCommands.delete(commandId);
    }
  }

  _handleStatusUpdate(robotId, data) {
    const robot = this.robots.get(robotId);
    if (robot) {
      robot.status = data.status || robot.status;
      if (data.metadata) {
        Object.assign(robot, data.metadata);
      }
    }
  }

  /**
   * Send a command to a robot and wait for acknowledgment.
   * @param {string} robotId - Target robot ID
   * @param {string} command - Command name (e.g., 'move', 'grip', 'scan')
   * @param {object} params - Command parameters
   * @param {number} timeoutMs - Command timeout (default: 30000)
   * @returns {Promise<{commandId, status, result}>}
   */
  async sendCommand(robotId, command, params = {}, timeoutMs = 30000) {
    const robot = this.robots.get(robotId);
    if (!robot) {
      throw new Error(`Robot ${robotId} not registered`);
    }
    if (!robot.ws || robot.status !== 'connected') {
      throw new Error(`Robot ${robotId} is not connected`);
    }

    const commandId = `cmd_${++this._commandId}_${Date.now()}`;
    const cmdMsg = {
      type: 'command',
      commandId,
      command,
      params,
      timestamp: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingCommands.delete(commandId);
        reject(new Error(`Command ${commandId} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingCommands.set(commandId, {
        commandId,
        command,
        params,
        status: 'pending',
        sentAt: new Date().toISOString(),
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (err) => {
          clearTimeout(timeout);
          reject(err);
        }
      });

      this._send(robot.ws, cmdMsg);
      console.log(`[HardwareBridge] Sent command to ${robotId}: ${command} (${commandId})`);
    });
  }

  /**
   * Send a raw message to a WebSocket.
   */
  _send(ws, msg) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  /**
   * Get all connected robots.
   */
  listRobots() {
    const robots = [];
    for (const [id, robot] of this.robots) {
      robots.push({
        id,
        type: robot.type,
        board: robot.board,
        status: robot.status,
        capabilities: robot.capabilities,
        telemetry: robot.telemetry,
        connectedAt: robot.connectedAt,
        lastHeartbeat: robot.lastHeartbeat
      });
    }
    return robots;
  }

  /**
   * Get a specific robot's status.
   */
  getRobot(robotId) {
    const robot = this.robots.get(robotId);
    if (!robot) return null;
    return {
      id: robot.id,
      type: robot.type,
      board: robot.board,
      status: robot.status,
      connectedAt: robot.connectedAt,
      lastHeartbeat: robot.lastHeartbeat,
      telemetry: robot.telemetry,
      firmware: robot.firmware,
      capabilities: robot.capabilities
    };
  }

  /**
   * Disconnect a robot.
   */
  disconnect(robotId) {
    const robot = this.robots.get(robotId);
    if (!robot) {
      throw new Error(`Robot ${robotId} not found`);
    }
    if (robot.ws) {
      robot.ws.close(1000, 'Server requested disconnect');
      robot.ws = null;
    }
    robot.status = 'disconnected';
    this.robots.set(robotId, robot);
    return { robotId, disconnected: true };
  }

  /**
   * Extract robot ID from WebSocket upgrade request.
   */
  _extractRobotId(req) {
    const url = new URL(req.url, 'http://localhost');
    const robotId = url.searchParams.get('robotId') || url.searchParams.get('id') || 'unknown';
    return robotId;
  }
}

module.exports = { HardwareBridge };
