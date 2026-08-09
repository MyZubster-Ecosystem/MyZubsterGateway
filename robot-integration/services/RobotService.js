// RobotService.js — Hardware Bridge for Physical Robots (Bounty BOT-8 #345)
// Supports Arduino, Raspberry Pi, Jetson Nano via MQTT/WebSocket

const crypto = require('crypto');

// In-memory stores (production: persistent DB)
const connectedRobots = new Map();
const commandQueue = new Map();
const telemetryLog = [];

// Telemetry buffer per robot (rolling window of last 100 readings)
const telemetryBuffer = new Map();

class RobotService {
  
  // ===== HARDWARE CONNECT =====
  /**
   * Register a physical robot connection
   * POST /api/robot/hardware/connect
   */
  static connectHardware({ name, type, protocol, host, port, capabilities = [] }) {
    if (!name || !type) throw new Error('name and type are required');
    
    const validTypes = ['arduino', 'raspberry-pi', 'jetson-nano', 'esp32', 'generic'];
    if (!validTypes.includes(type)) throw new Error(`Invalid type: ${type}. Valid: ${validTypes.join(', ')}`);
    
    const robotId = 'ROBOT-' + crypto.randomBytes(6).toString('hex');
    const robot = {
      id: robotId,
      name,
      type,
      protocol: protocol || 'mqtt',
      host: host || 'localhost',
      port: port || (protocol === 'websocket' ? 8080 : 1883),
      capabilities,
      status: 'connecting',
      connectedAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      telemetry: { cpu: 0, memory: 0, temperature: 0, battery: null }
    };
    
    connectedRobots.set(robotId, robot);
    
    // Initialize telemetry buffer
    telemetryBuffer.set(robotId, []);
    
    // Initialize empty command queue
    commandQueue.set(robotId, []);
    
    // Simulate connection established
    setTimeout(() => {
      if (connectedRobots.has(robotId)) {
        robot.status = 'connected';
        robot.lastHeartbeat = new Date().toISOString();
      }
    }, 500);
    
    return { success: true, robot, message: `Robot ${name} (${type}) registered via ${robot.protocol}` };
  }
  
  // ===== DISCONNECT =====
  static disconnectHardware(robotId) {
    const robot = connectedRobots.get(robotId);
    if (!robot) throw new Error('Robot not found');
    
    robot.status = 'disconnected';
    connectedRobots.delete(robotId);
    commandQueue.delete(robotId);
    telemetryBuffer.delete(robotId);
    
    return { success: true, message: `Robot ${robot.name} disconnected`, robotId };
  }
  
  // ===== LIST CONNECTED =====
  static listConnected() {
    const robots = Array.from(connectedRobots.values()).map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      protocol: r.protocol,
      status: r.status,
      connectedAt: r.connectedAt,
      lastHeartbeat: r.lastHeartbeat,
      capabilities: r.capabilities.length
    }));
    return { success: true, robots, total: robots.length };
  }
  
  // ===== SEND COMMAND =====
  /**
   * Send a command to a physical robot
   * POST /api/robot/hardware/command
   */
  static sendCommand(robotId, { command, params = {}, priority = 'normal' }) {
    const robot = connectedRobots.get(robotId);
    if (!robot) throw new Error('Robot not found');
    if (robot.status !== 'connected') throw new Error(`Robot ${robot.name} is ${robot.status}`);
    
    const commandId = 'CMD-' + crypto.randomBytes(4).toString('hex');
    const cmd = {
      id: commandId,
      robotId,
      command,
      params,
      priority,
      status: 'pending',
      issuedAt: new Date().toISOString(),
      completedAt: null,
      result: null
    };
    
    const queue = commandQueue.get(robotId) || [];
    queue.push(cmd);
    commandQueue.set(robotId, queue);
    
    // Simulate execution (production: forward via MQTT/WS to robot)
    setTimeout(() => {
      cmd.status = 'executed';
      cmd.completedAt = new Date().toISOString();
      cmd.result = { executed: true, response: `Command "${command}" executed on ${robot.name}` };
    }, 1000);
    
    return { success: true, command: cmd, message: `Command "${command}" sent to ${robot.name}` };
  }
  
  // ===== COMMAND HISTORY =====
  static getCommandHistory(robotId, limit = 20) {
    const robot = connectedRobots.get(robotId);
    if (!robot) throw new Error('Robot not found');
    
    const queue = commandQueue.get(robotId) || [];
    const history = queue.slice(-limit).reverse();
    return { success: true, robotId, robotName: robot.name, commands: history, total: queue.length };
  }
  
  // ===== RECEIVE TELEMETRY =====
  /**
   * Receive telemetry data from a physical robot
   * POST /api/robot/hardware/telemetry
   */
  static receiveTelemetry(robotId, { cpu, memory, temperature, battery, sensors = {}, position = {} }) {
    const robot = connectedRobots.get(robotId);
    if (!robot) throw new Error('Robot not found');
    
    const telemetry = {
      robotId,
      timestamp: new Date().toISOString(),
      cpu: cpu ?? robot.telemetry?.cpu ?? 0,
      memory: memory ?? robot.telemetry?.memory ?? 0,
      temperature: temperature ?? robot.telemetry?.temperature ?? 0,
      battery: battery ?? robot.telemetry?.battery ?? null,
      sensors,
      position
    };
    
    // Update robot's current telemetry
    robot.telemetry = { cpu: telemetry.cpu, memory: telemetry.memory, temperature: telemetry.temperature, battery: telemetry.battery };
    robot.lastHeartbeat = telemetry.timestamp;
    
    // Add to telemetry log (global)
    telemetryLog.push(telemetry);
    if (telemetryLog.length > 10000) telemetryLog.shift();
    
    // Add to rolling buffer per robot (last 100)
    const buffer = telemetryBuffer.get(robotId) || [];
    buffer.push(telemetry);
    if (buffer.length > 100) buffer.shift();
    telemetryBuffer.set(robotId, buffer);
    
    return { success: true, telemetry, message: `Telemetry received from ${robot.name}` };
  }
  
  // ===== GET TELEMETRY =====
  static getTelemetry(robotId, limit = 50) {
    if (robotId) {
      const robot = connectedRobots.get(robotId);
      if (!robot) throw new Error('Robot not found');
      const buffer = telemetryBuffer.get(robotId) || [];
      return { success: true, robotId, robotName: robot.name, telemetry: buffer.slice(-limit).reverse(), count: buffer.length };
    }
    // All robots
    const allTelemetry = Array.from(connectedRobots.entries()).map(([id, robot]) => ({
      id,
      name: robot.name,
      current: robot.telemetry,
      lastHeartbeat: robot.lastHeartbeat,
      status: robot.status
    }));
    return { success: true, robots: allTelemetry, total: allTelemetry.length };
  }
  
  // ===== HEARTBEAT =====
  static heartbeat(robotId) {
    const robot = connectedRobots.get(robotId);
    if (!robot) throw new Error('Robot not found');
    
    robot.lastHeartbeat = new Date().toISOString();
    if (robot.status === 'connecting') robot.status = 'connected';
    
    return { success: true, robotId, timestamp: robot.lastHeartbeat, status: robot.status };
  }
  
  // ===== INTEGRATION DOCS =====
  static getIntegrationDocs() {
    return {
      success: true,
      protocols: {
        mqtt: {
          description: 'MQTT protocol for IoT/robot communication',
          defaultPort: 1883,
          topics: {
            command: 'myzubster/robot/{robotId}/command',
            telemetry: 'myzubster/robot/{robotId}/telemetry',
            heartbeat: 'myzubster/robot/{robotId}/heartbeat',
            status: 'myzubster/robot/{robotId}/status'
          }
        },
        websocket: {
          description: 'WebSocket for real-time bidirectional communication',
          defaultPort: 8080,
          endpoints: {
            connect: 'ws://api.myzubster.com/ws/robot/{robotId}'
          }
        }
      },
      supportedHardware: ['arduino', 'raspberry-pi', 'jetson-nano', 'esp32', 'generic'],
      quickStart: {
        arduino: 'Connect via MQTT using PubSubClient library. Subscribe to myzubster/robot/{id}/command and publish telemetry to myzubster/robot/{id}/telemetry.',
        raspberryPi: 'Use paho-mqtt Python library. Connect to MQTT broker, subscribe command topic, publish sensor data.',
        jetsonNano: 'Use MQTT or WebSocket. For WebSocket: connect to wss://api.myzubster.com/ws/robot/{id}'
      }
    };
  }
}

module.exports = RobotService;
