# Hardware Bridge Integration Guide

## Overview

The Hardware Bridge connects physical robots (Arduino, Raspberry Pi, Jetson Nano) to the MyZubster Gateway using WebSocket or MQTT protocols.

## Supported Hardware

| Board | Protocol | Default Transport | Notes |
|-------|----------|-------------------|-------|
| Arduino Uno/Mega | WebSocket | Wi-Fi/Ethernet shield | Use ArduinoWebsockets library |
| Raspberry Pi 4/5 | WebSocket / MQTT | Built-in Wi-Fi | Python `websockets` or `paho-mqtt` |
| Jetson Nano/Orin | WebSocket | Built-in Wi-Fi/LAN | Python or C++ SDK |
| ESP32 | WebSocket / MQTT | Built-in Wi-Fi | Arduino framework |

## Connection Flow

1. Robot connects to `wss://gateway.myzubster.com/api/robot/hardware/ws?robotId=ROBOT_ID`
2. Server sends `welcome` message with protocol version
3. Robot sends `heartbeat` every 30 seconds
4. Server sends `command` messages for tasks
5. Robot sends `telemetry` updates every 5 seconds

## Message Protocol

### Server → Robot

```json
{
  "type": "command",
  "commandId": "cmd_1_1234567890",
  "command": "move",
  "params": { "x": 100, "y": 200, "speed": 50 },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### Robot → Server

```json
{
  "type": "command_ack",
  "commandId": "cmd_1_1234567890",
  "status": "completed",
  "result": { "position": { "x": 100, "y": 200 } }
}
```

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/robot/hardware/connect` | Register robot |
| GET | `/api/robot/hardware/list` | List all robots |
| GET | `/api/robot/hardware/:id` | Get robot status |
| POST | `/api/robot/hardware/:id/command` | Send command |
| POST | `/api/robot/hardware/:id/disconnect` | Disconnect |

## Robot Firmware Example (Arduino/ESP32)

```cpp
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

WebSocketsClient ws;

void setup() {
  WiFi.begin("SSID", "PASSWORD");
  ws.begin("gateway.myzubster.com", 443, "/api/robot/hardware/ws?robotId=arm-01");
  ws.onEvent(webSocketEvent);
}

void loop() {
  ws.loop();
  static unsigned long lastHeartbeat = 0;
  if (millis() - lastHeartbeat > 30000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WS_HEARTBEAT_INTERVAL` | 30000 | Heartbeat interval (ms) |
| `WS_COMMAND_TIMEOUT` | 30000 | Command timeout (ms) |
| `WS_MAX_ROBOTS` | 100 | Max concurrent robot connections |
