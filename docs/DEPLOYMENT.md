# Distribuzione di MyZubsterGateway

## Preparazione

```bash
npm install
cd frontend
npm install
npm run build
cd ..
npm start
```

Il backend serve `frontend/dist`. Configurare MongoDB, variabili d'ambiente e HTTPS prima della produzione.

## Docker

Il `Dockerfile` usa `node:20-alpine`, espone `10000` e avvia `node server.js`.

```bash
docker build -t myzubster-gateway .
docker run --rm -p 10000:10000 \
  -e PORT=10000 \
  -e MONGODB_URI='mongodb://host.docker.internal:27017/myzubster' \
  myzubster-gateway
```

Il Dockerfile corrente non compila il frontend. Creare `frontend/dist` prima del build oppure proporre separatamente un Dockerfile multi-stage verificato.

## Render

Il repository non contiene `render.yaml`; configurare manualmente un Web Service Node:

- Build command: `npm install && cd frontend && npm install && npm run build`
- Start command: `npm start`
- Environment: almeno `MONGODB_URI`; Render fornisce normalmente `PORT`.
- Health check: `/api/health`.

Impostare segreti nel pannello Render, mai nel repository.

## Netlify

Il `netlify.toml` corrente salta la build e pubblica la root del repository. Non esegue il server Express e non rappresenta una build Vite completa.

Una futura distribuzione frontend-only pu? usare, dopo accordo con i maintainer:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"
```

Il frontend separato deve chiamare un backend pubblico e quel backend deve autorizzare il dominio Netlify tramite CORS. Verificare prima se le deploy preview esistenti dipendono dalla configurazione attuale.

## Verifica post-deploy

```bash
curl https://<dominio>/api/health
curl https://<dominio>/api/swap/rate
```

Controllare inoltre connessione MongoDB, caricamento di `frontend/dist/index.html`, CORS dal dominio reale e shutdown durante un redeploy.

## Rollback

Conservare il riferimento del commit distribuito. In caso di regressione ripristinare l'ultimo deploy funzionante dal provider, verificare l'health check e raccogliere i log prima di una nuova distribuzione.
