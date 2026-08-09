# Contribuire a MyZubsterGateway

## Prima di iniziare

1. Cercare issue e pull request gi? aperte.
2. Per una bounty, ottenere assegnazione e conferma scritta di ambito, ricompensa, valuta e fondi.
3. Mantenere ogni pull request focalizzata su una sola issue.
4. Non pubblicare token, password, file `.env`, seed phrase o chiavi.

## Ambiente locale

```bash
git clone https://github.com/MyZubster-Ecosystem/MyZubsterGateway.git
cd MyZubsterGateway
npm install
cp .env.example .env
npm start
curl http://localhost:10000/api/health
```

Frontend:

```bash
cd frontend
npm install
npm run lint
npm run build
```

## Branch e commit

- Partire dal branch base aggiornato e creare un branch dedicato.
- Non includere `node_modules`, build generate, `.env`, log o modifiche non correlate.
- Usare commit descrittivi, per esempio `docs: document Render deployment`.
- Aggiungere una dipendenza solo con motivazione e lockfile aggiornato.

## Qualit?

- Seguire lo stile dei file circostanti.
- Validare input e gestire errori coerentemente.
- Aggiungere test quando cambia il comportamento.
- Nei documenti, verificare comandi, percorsi, variabili ed endpoint nel codice.
- Distinguere simulazioni e integrazioni finanziarie reali.

## Checklist pull request

- issue e obiettivo indicati;
- diff limitato all'ambito;
- controlli eseguiti descritti;
- nessun segreto o dato personale;
- documentazione aggiornata;
- limiti noti dichiarati.

Usare `Closes #<numero>` soltanto quando la pull request soddisfa l'intero ambito. Rispondere alla review con commit mirati e non chiudere discussioni senza aver verificato il problema.
