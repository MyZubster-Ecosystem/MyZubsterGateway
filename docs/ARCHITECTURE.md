# Architettura MyZubsterGateway

## Panoramica
MyZubsterGateway è il punto di accesso API per l'ecosistema MyZubster.

## Componenti Principali
- **Gateway API**: Espone endpoint RESTful
- **Authentication**: JWT-based auth
- **Wallet**: MYZ e XMR integration
- **Database**: JSON-based storage

## Flussi Principali
1. Autenticazione → Token JWT
2. Pagamenti → MYZ/XMR
3. Orti → Registrazione piante
