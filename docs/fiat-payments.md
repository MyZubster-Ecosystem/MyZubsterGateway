# Fiat Payments Gateway (USD, EUR, GBP)

Questo modulo gestisce il supporto per i pagamenti in valuta fiat tradizionale tramite carte di credito, integrandoli nel sistema MyZubster e convertendoli automaticamente in MYZ per le ricompense.

## Funzionalità
- Supporto nativo per **USD**, **EUR**, e **GBP**.
- **Tassi di Cambio in tempo reale:** Le API recuperano il tasso corrente per mostrare all'utente i MYZ ricevuti.
- **Checkout Gateway:** Permette il caricamento fondi da carte tramite \`cardToken\`.
- **Dashboard Unificata:** Visualizzazione consolidata dei pagamenti.

## Endpoints

### 1. Tassi di Cambio
\`GET /api/payments/fiat/rates\`

### 2. Processo di Checkout
\`POST /api/payments/fiat/checkout\`
\`\`\`json
{
  "currency": "EUR",
  "amount": 100,
  "cardToken": "tok_visa_mock_123"
}
\`\`\`

### 3. Dashboard
\`GET /api/payments/fiat/dashboard\`
