# IoT Sensors per Orti Urbani

Questo modulo gestisce i sensori IoT per il monitoraggio della temperatura e dell'umidità del suolo.

## Endpoints

### 1. Invio Dati Telemetria (Sensori)
\`POST /api/iot/sensors/telemetry\`
Invia i dati letti dal sensore.
**Body:**
\`\`\`json
{
  "deviceId": "orto-1",
  "temperature": 24.5,
  "humidity": 60.2
}
\`\`\`

### 2. Dashboard in Tempo Reale
\`GET /api/iot/sensors/dashboard/:deviceId\`
Restituisce lo stato corrente e lo storico delle letture (ultimi 100 eventi) per un dispositivo.

### 3. Lista Dispositivi Attivi
\`GET /api/iot/sensors/devices\`
Elenca tutti i sensori che hanno inviato dati.
