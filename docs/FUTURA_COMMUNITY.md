# FUTURA Community Ambientale

Questo modulo fornisce le API per gestire la community ambientale MyZubster FUTURA.

## Endpoint Disponibili

### 1. Community
- `GET /profiles` - Ottieni profili utenti
- `POST /profiles` - Crea un profilo
- `GET /reports` - Ottieni segnalazioni
- `POST /reports` - Crea una segnalazione
- `GET /projects` - Lista progetti

### 2. Educazione Ambientale
- `GET /courses` - Lista corsi
- `GET /quizzes` - Lista quiz
- `GET /videos` - Lista video

### 3. Gamification
- `GET /leaderboard` - Classifica utenti per punti
- `POST /points/add` - Aggiungi punti ad un utente
- `POST /badges/add` - Aggiungi un badge ad un utente

### 4. Social
- `GET /forum` - Lista post nel forum
- `GET /groups` - Lista gruppi
- `GET /chat` - Storico chat
- `POST /chat` - Invia messaggio in chat
