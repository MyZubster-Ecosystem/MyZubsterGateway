# 🐳 Docker Setup — MyZubster Gateway

Avvia l'intero ambiente MyZubster Gateway con Docker Compose.

## Prerequisiti

- [Docker](https://docs.docker.com/get-docker/) v24+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

## Avvio rapido

```bash
# 1. Copia il file di configurazione
cp .env.example .env

# 2. (Opzionale) Modifica le variabili in .env
nano .env

# 3. Avvia tutti i servizi
docker-compose up -d

# 4. Verifica lo stato
docker-compose ps
```

## Servizi

| Servizio | Porta | Descrizione |
|----------|-------|-------------|
| **gateway** | `3000` | Gateway Node.js Express (principale) |
| **mongodb** | `27017` | Database MongoDB 7 |
| **redis** | `6379` | Cache e session store Redis 7 |
| **tari-wallet** | `12000` | Wallet Tari (stub per MYZ) |
| **monero-wallet** | `13000` | Wallet Monero (stub per XMR) |

## Comandi utili

```bash
# Avvia tutti i servizi in background
docker-compose up -d

# Visualizza i log
docker-compose logs -f gateway

# Ferma tutti i servizi
docker-compose down

# Ferma e rimuovi volumi (⚠️ cancella i dati!)
docker-compose down -v

# Ricostruisci l'immagine del gateway
docker-compose build gateway

# Riavvia un singolo servizio
docker-compose restart gateway

# Entra nel container del gateway
docker-compose exec gateway sh
```

## Sviluppo locale

```bash
# Avvia in modalità sviluppo con hot-reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Oppure modifica docker-compose.yml decommentando:
#   volumes:
#     - ./:/app
#     - /app/node_modules
```

## Verifica

```bash
# Health check del gateway
curl http://localhost:3000/health

# Health check Tari wallet
curl http://localhost:12000/health

# Health check Monero wallet
curl http://localhost:13000/health
```

## Risoluzione problemi

| Problema | Soluzione |
|----------|-----------|
| Porta già in uso | Modifica `GATEWAY_PORT` in `.env` |
| MongoDB non si connette | Verifica `MONGO_USER`/`MONGO_PASSWORD` in `.env` |
| Permessi volume | `sudo chown -R 1001:1001 ./data` |
| Build fallita | `docker-compose build --no-cache gateway` |

---

📖 [Guida completa ai bounty](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/blob/main/docs/BOUNTY.md)
