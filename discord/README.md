# MyZubster Discord Server Setup

Configurazione del server Discord ufficiale MyZubster Gateway.

## 🚀 Setup Rapido

### 1. Crea il bot Discord
1. Vai su [Discord Developer Portal](https://discord.com/developers/applications)
2. Crea una nuova applicazione "MyZubster"
3. Vai su Bot → Add Bot
4. Copia il token e salvalo in `bot/.env`

### 2. Invita il bot al server
```
https://discord.com/api/oauth2/authorize?client_id=TUO_CLIENT_ID&permissions=8&scope=bot
```

### 3. Avvia il bot
```bash
cd bot/
npm install
npm start
```

### 4. Configura il server
Usa `server-config.yml` come riferimento per creare i canali manualmente o usa un bot di gestione.

## 📁 Struttura

```
discord/
  bot/
    index.js          # Bot principale (moderazione, auto-ruoli, comandi)
    package.json      # Dipendenze (discord.js v14)
    .env.example      # Template variabili d'ambiente
  server-config.yml   # Configurazione canali e ruoli
  rules.md            # Regole della community
  README.md           # Questo file
```

## 🤖 Features del Bot
- **Auto-ruolo**: Assegna automaticamente il ruolo "Community" ai nuovi membri
- **Benvenuto**: Embed di benvenuto personalizzato nel canale #benvenuto
- **Anti-spam**: Rate limiting (5 messaggi in 5 secondi = timeout 60s)
- **Comandi**:
  - `!regole` - Mostra dove leggere le regole
  - `!info` - Info sul server (membri, canali, GitHub)
  - `!ping` - Verifica latenza del bot

## 📊 Obiettivi (30 giorni)
- [x] Server configurato con canali
- [x] Bot di moderazione attivo
- [ ] 50+ membri (crescita organica)
- [ ] Eventi settimanali (calendario)
- [x] Regole e linee guida

## 🔐 Sicurezza
- Il token del bot NON deve essere committato
- Usa `.env` per le variabili d'ambiente
- Il file `.env` e' in `.gitignore`

## 📝 Licenza
MIT - MyZubster Ecosystem
