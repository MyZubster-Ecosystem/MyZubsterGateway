# Documentazione di MyZubsterGateway

Guida verificata sul repository per installazione, configurazione, architettura e API.

## Architettura

MyZubsterGateway ? un'applicazione Node.js/Express che si collega a MongoDB con Mongoose e serve il frontend React/Vite da `frontend/dist`.

```text
Client
  -> server.js
     -> /api/swap          routes/swap.js
     -> /api/animals       routes/animals.js
     -> /api/plants        routes/plants.js
     -> /api/rewards       routes/rewards.js
     -> /api/contributors  routes/contributors.js
     -> /api/robot         routes/robot.js
     -> /api/robot/logo    routes/robotLogo.js
     -> frontend/dist
```

| Percorso | Responsabilit? |
|---|---|
| `server.js` | Middleware, route, MongoDB, file statici e shutdown |
| `routes/` | Endpoint Express |
| `controllers/` | Logica applicativa per alcune risorse |
| `models/` | Modelli Mongoose |
| `services/` | Servizi riutilizzabili |
| `frontend/` | Applicazione React/Vite |
| `docs/` | Riferimenti API e guide specialistiche |

## Prerequisiti

- Node.js 20; il frontend richiede almeno Node `20.19`.
- npm e Git.
- MongoDB locale o remoto.

```bash
node --version
npm --version
git --version
```

## Installazione

```bash
git clone https://github.com/MyZubster-Ecosystem/MyZubsterGateway.git
cd MyZubsterGateway
npm install
cp .env.example .env
npm start
```

In PowerShell usare `Copy-Item .env.example .env`.

Il comando `npm start` esegue `node server.js`. La porta predefinita ? `10000`.

```bash
curl http://localhost:10000/api/health
```

## Configurazione

| Variabile | Default o esempio | Uso |
|---|---|---|
| `PORT` | `10000` | Porta HTTP |
| `MONGODB_URI` | `mongodb://localhost:27017/myzubster` | Connessione MongoDB |
| `XMR_WALLET_URL` | `http://127.0.0.1:18083` | Wallet RPC |
| `XMR_REQUIRED_CONFIRMATIONS` | `10` | Conferme XMR |
| `XMR_FCMP_PLUS_PLUS_ENABLED` | `false` | Modalit? FCMP++ |
| `XMR_FCMP_REQUIRED_CONFIRMATIONS` | `10` | Conferme FCMP |
| `WEBHOOK_SECRET` | nessuno | Verifica webhook GitHub |
| `ROBOT_STATS_CACHE_TTL` | `10` secondi | Cache statistiche robot |

Esempio:

```dotenv
PORT=10000
MONGODB_URI=mongodb://localhost:27017/myzubster
XMR_WALLET_URL=http://127.0.0.1:18083
XMR_REQUIRED_CONFIRMATIONS=10
WEBHOOK_SECRET=sostituire-con-un-segreto-casuale
```

Non pubblicare `.env`, credenziali MongoDB, token, seed phrase o chiavi wallet.

## Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
npm run preview
```

Durante lo sviluppo usare `npm run dev`. Il backend serve `frontend/dist`; compilare il frontend prima di avviare una distribuzione completa. La pagina `/bounty` richiede `frontend/dist/bounty.html`.

## API montate dal server

| Metodo | Percorso | Funzione |
|---|---|---|
| `GET` | `/api/health` | Stato e uptime |
| `GET` | `/api/swap/rate` | Tasso simulato XMR/MYZ |
| `POST` | `/api/swap/execute` | Swap simulato |
| `POST` | `/api/animals/register` | Registra animale |
| `GET` | `/api/animals` | Elenca animali |
| `GET/PUT/DELETE` | `/api/animals/:id` | Legge, aggiorna o elimina animale |
| `POST` | `/api/plants/register` | Registra pianta |
| `GET` | `/api/plants` | Elenca piante |
| `GET` | `/api/rewards?userId=...` | Elenca ricompense |
| `POST` | `/api/rewards/trigger` | Crea ricompensa |
| `GET` | `/api/contributors/stats` | Statistiche contributor |
| `POST` | `/api/robot/create` | Crea robot in memoria |
| `POST` | `/api/robot/assign` | Assegna job |
| `POST` | `/api/robot/execute` | Esegue job |
| `POST` | `/api/robot/deliver` | Consegna job |
| `POST` | `/api/robot/job/complete` | Esegue e consegna job |
| `POST` | `/api/robot/dispute` | Apre disputa |
| `GET` | `/api/robot/stats` | Statistiche robot |
| `GET` | `/api/robot/status/:robotId` | Stato robot |

Esempi:

```bash
curl http://localhost:10000/api/swap/rate

curl -X POST http://localhost:10000/api/swap/execute \
  -H "Content-Type: application/json" \
  -d '{"from":"XMR","to":"MYZ","amount":0.1,"userId":"demo"}'

curl -X POST http://localhost:10000/api/robot/create \
  -H "Content-Type: application/json" \
  -d '{"robotId":"robot-001","name":"Demo Robot","walletAddress":"wallet-demo"}'
```

Il tasso swap nel codice ? simulato e non ? una quotazione di mercato. Gli endpoint persistenti richiedono MongoDB; lo stato robot principale ? in memoria e pu? essere perso al riavvio.

## Sicurezza

- Proteggere MongoDB e wallet RPC dalla rete pubblica.
- Usare HTTPS e un `WEBHOOK_SECRET` casuale.
- Non registrare segreti o URI con password.
- Il CORS corrente consente `https://myzubster.com` e `https://www.myzubster.com`.
- Verificare le integrazioni finanziarie prima dell'uso reale.

## Problemi comuni

- `ECONNREFUSED` MongoDB: avviare MongoDB o correggere `MONGODB_URI` e allowlist.
- `frontend/dist/index.html` mancante: eseguire `npm run build` in `frontend/`.
- Errore CORS: usare un proxy di sviluppo o proporre una modifica revisionata alle origini.
- Porta occupata: eseguire `PORT=10001 npm start` oppure impostare `$env:PORT=10001` in PowerShell.

## Riferimenti

- `CONTRIBUTING.md`: flusso di contribuzione.
- `docs/DEPLOYMENT.md`: Docker, Render e Netlify.
- `docs/API_REFERENCE.md`: catalogo API esteso.
- `swagger.json` e `docs/openapi/robot-stats.yaml`: specifiche API.
- `docs/AUDIT_LOGGING.md` e `docs/robots/README.md`: guide specialistiche.

Alcuni documenti estesi possono descrivere moduli non montati dal `server.js` corrente: verificare sempre il codice prima di integrare un endpoint.

## Licenza

Consultare `LICENSE` nel repository.
