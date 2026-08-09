# How to Start Without Monero

## Alternative a Monero

### 1. Utilizzare MYZ (Token Nativo)
- Completa bounty su GitHub
- Zero commissioni

### 2. Utilizzare Altre Criptovalute
- BTC, ETH, ADA supportate

### 3. Pagamenti Fiat
- USD, EUR, GBP via Stripe

## Configurazione Iniziale

### Crea Account
curl -X POST https://api.myzubster.com/api/auth/register -H "Content-Type: application/json" -d '{"username":"user","email":"user@email.com","password":"pass"}'

### Usa MYZ
curl https://api.myzubster.com/api/tokens/balance/userId

### Usa Crypto
curl https://api.myzubster.com/api/crypto/rates

### Usa Fiat
curl -X POST https://api.myzubster.com/api/payments/fiat/create -H "Content-Type: application/json" -d '{"amount":100,"currency":"USD","userId":"userId"}'
