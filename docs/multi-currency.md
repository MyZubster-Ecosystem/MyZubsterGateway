# Multi-Currency Crypto Payments (BTC, ETH, ADA)

Questo modulo gestisce il supporto per i pagamenti in criptovalute addizionali, integrandoli nel sistema MyZubster e convertendoli automaticamente in MYZ.

## Funzionalità
- Supporto per **Bitcoin (BTC)**, **Ethereum (ETH)**, e **Cardano (ADA)**.
- **Tassi di Cambio in tempo reale:** Le API recuperano il tasso corrente per mostrare all'utente l'esatto ammontare crypto equivalente.
- **Dashboard Unificata:** Visualizzazione consolidata dei pagamenti pending in ogni valuta e i MYZ totali confermati.
- **Auto-conversione:** Utilizzo di Webhook per ascoltare la blockchain; quando una transazione è confermata, l'importo viene automaticamente convertito nel wallet dell'utente.

## Endpoints

### 1. Tassi di Cambio
\`GET /api/payments/multi-currency/rates\`

### 2. Richiesta Pagamento
\`POST /api/payments/multi-currency/payment/request\`
\`\`\`json
{
  "currency": "BTC",
  "amountMYZ": 500
}
\`\`\`

### 3. Dashboard
\`GET /api/payments/multi-currency/dashboard\`

### 4. Webhook di Conferma
\`POST /api/payments/multi-currency/webhook/confirm\`
\`\`\`json
{
  "txId": "...",
  "txHash": "0x..."
}
\`\`\`
