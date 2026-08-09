# Guida Introduttiva

## Cos'e MyZubster?

MyZubster e un gateway decentralizzato che collega pagamenti fiat e crypto.
Supporta Monero (XMR), stablecoin (USDC/USDT) e la valuta nativa MYZ.

## Prerequisiti

- Node.js >= 18
- MongoDB >= 6.0
- Docker (opzionale, per deployment containerizzato)

## Quick Start

```bash
git clone https://github.com/MyZubster-Ecosystem/MyZubsterGateway.git
cd MyZubsterGateway
npm install
cp .env.example .env
# Configura le variabili d'ambiente
npm run dev
```

Apri http://localhost:3000 nel browser.

## Struttura del Progetto

```
MyZubsterGateway/
  public/        # Frontend statico
  src/           # Backend API
  docs/          # Documentazione
  tests/         # Test suite
  scripts/       # Utility scripts
```

## Primo Pagamento

1. Registrati su http://localhost:3000
2. Vai su "Wallet" e genera un indirizzo XMR
3. Invia XMR all'indirizzo generato
4. Monitora la transazione nella dashboard

## Prossimi Passi

- [Configurazione](CONFIGURATION.md)
- [API Reference](API_REFERENCE.md)
- [Guida Escrow](GUIDE_ESCROW.md)
