// services/evaService.js - EVA IONI: Braccio robotico per orti urbani
const sensorService = require('./sensorService');

class EVAService {
  constructor() {
    this.state = {
      status: 'idle',
      joints: { base: 0, shoulder: 45, elbow: 90, wrist: 0 },
      gripper: 'open',
      pressure: 0,
      currentTask: null,
      gardenId: null
    };
    this.taskHistory = [];
    console.log('[EVA-IONI] Braccio robotico inizializzato');
  }

  getStatus() {
    return {
      ...this.state,
      taskHistory: this.taskHistory.slice(-10).reverse(),
      timestamp: new Date().toISOString()
    };
  }

  async executeTask(task, position, gardenId) {
    const validTasks = ['plant_seed', 'water', 'harvest', 'scan'];
    if (!validTasks.includes(task)) {
      throw new Error('Task non valido: ' + task);
    }

    this.state.status = 'working';
    this.state.currentTask = task;
    this.state.gardenId = gardenId;

    // Simula movimenti robotici
    const movements = {
      plant_seed: { base: 90, shoulder: 60, elbow: 120, wrist: 45, gripper: 'close', pressure: 3 },
      water: { base: 45, shoulder: 30, elbow: 80, wrist: 90, gripper: 'close', pressure: 2 },
      harvest: { base: 135, shoulder: 75, elbow: 100, wrist: 30, gripper: 'close', pressure: 5 },
      scan: { base: position.x || 0, shoulder: 45, elbow: 90, wrist: 0, gripper: 'open', pressure: 0 }
    };

    const m = movements[task];
    this.state.joints = { base: m.base, shoulder: m.shoulder, elbow: m.elbow, wrist: m.wrist };
    this.state.gripper = m.gripper;
    this.state.pressure = m.pressure;

    // Registra dati sensori correlati
    if (gardenId) {
      try {
        await sensorService.getGardenData(gardenId, 1);
      } catch (e) {
        // Sensor data optional
      }
    }

    const result = {
      task,
      position,
      gardenId,
      joints: { ...this.state.joints },
      gripper: this.state.gripper,
      pressure: this.state.pressure,
      status: 'completed',
      timestamp: new Date().toISOString()
    };

    this.taskHistory.push(result);
    if (this.taskHistory.length > 100) this.taskHistory.shift();

    this.state.status = 'idle';
    this.state.currentTask = null;

    return result;
  }

  // Arduino integration placeholder
  getArduinoConfig() {
    return {
      board: 'Arduino Uno',
      pins: {
        base: 9,
        shoulder: 10,
        elbow: 11,
        wrist: 6,
        gripper: 5,
        pressureSensor: 'A0'
      },
      baudRate: 9600,
      apiEndpoint: '/eva/arduino',
      sampleCode: '#include <Servo.h>\nServo base, shoulder, elbow, wrist;\nvoid setup() {\n  Serial.begin(9600);\n  base.attach(9);\n  // ... init servos\n}\nvoid loop() {\n  if(Serial.available()) {\n    // Parse commands from MyZubster API\n  }\n}'
    };
  }

  getDocumentation() {
    return {
      name: 'EVA IONI - Braccio Robotico 4 DOF',
      specs: {
        dof: 4,
        reach: '30 cm',
        payload: '200g',
        precision: '0.5 mm',
        gripForce: '0-5 N',
        sensors: ['pressure', 'position', 'temperature'],
        communication: 'Serial (USB) / WiFi',
        powerSupply: '12V DC'
      },
      assembly: [
        '1. Montare base rotante su superficie stabile',
        '2. Fissare servo spalla (SG90/MG90S)',
        '3. Collegare gomito con leveraggio',
        '4. Installare pinza con sensore pressione',
        '5. Connettere Arduino Uno via USB',
        '6. Caricare firmware da /eva/arduino'
      ],
      safetyNotes: [
        'Tenere dita lontane dalla pinza durante il funzionamento',
        'Non superare 5N di forza di presa',
        'Area di lavoro: 30 cm di raggio minimo',
        'Temperatura operativa: 0-40C'
      ]
    };
  }
}

module.exports = new EVAService();
