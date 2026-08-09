const faqData = [
  {
    id: 1,
    category: "Generale",
    question: "Cos'è MyZubster?",
    answer: "MyZubster è una piattaforma decentralizzata che permette lo scambio di competenze e servizi in modo sicuro e privato, utilizzando la tecnologia blockchain per garantire trasparenza e fiducia tra gli utenti."
  },
  {
    id: 2,
    category: "Generale",
    question: "Come posso registrarmi su MyZubster?",
    answer: "Per registrarti, clicca su 'Registrati' nel menu di navigazione. Puoi creare un account utilizzando email e password, o tramite wallet esterno. La registrazione è gratuita e richiede solo pochi minuti."
  },
  {
    id: 3,
    category: "Generale",
    question: "MyZubster è gratuito?",
    answer: "La registrazione e la navigazione di base sono gratuite. Alcune funzionalità avanzate, come la creazione di offerte premium o l'accesso a strumenti analytics, potrebbero richiedere l'utilizzo di token MYZ."
  },
  {
    id: 4,
    category: "Account",
    question: "Come posso recuperare la mia password?",
    answer: "Vai alla pagina di login e clicca su 'Password dimenticata?'. Inserisci la tua email e riceverai un link per reimpostare la password. Se non ricevi l'email, controlla la cartella spam."
  },
  {
    id: 5,
    category: "Account",
    question: "Posso avere più account?",
    answer: "Sì, è possibile avere più account, ma ti consigliamo di mantenerne uno solo per una migliore gestione della reputazione e delle transazioni. Account multipli potrebbero essere soggetti a verifica aggiuntiva."
  },
  {
    id: 6,
    category: "Account",
    question: "Come posso eliminare il mio account?",
    answer: "Vai nelle impostazioni del profilo e seleziona 'Elimina account'. La cancellazione è definitiva e comporta la perdita di tutti i dati associati, inclusi saldi e reputazione."
  },
  {
    id: 7,
    category: "Account",
    question: "Come funziona la verifica dell'identità?",
    answer: "La verifica dell'identità è opzionale ma consigliata. Puoi verificare il tuo account collegando un wallet o fornendo documenti di identità. Gli account verificati godono di maggiore fiducia nella community."
  },
  {
    id: 8,
    category: "Token e Pagamenti",
    question: "Cos'è il token MYZ?",
    answer: "MYZ è il token nativo della piattaforma MyZubster. Viene utilizzato per transazioni, ricompense, e accesso a funzionalità premium. I token possono essere guadagnati completando bounty o acquistati tramite exchange."
  },
  {
    id: 9,
    category: "Token e Pagamenti",
    question: "Come posso acquistare token MYZ?",
    answer: "Puoi acquistare token MYZ direttamente dalla sezione 'Token' del tuo dashboard, tramite bonifico bancario, criptovalute (BTC, ETH, USDT) o carta di credito. I token vengono accreditati immediatamente dopo la conferma del pagamento."
  },
  {
    id: 10,
    category: "Token e Pagamenti",
    question: "Quali metodi di pagamento sono accettati?",
    answer: "Accettiamo pagamenti in criptovalute (BTC, ETH, USDT, XMR), bonifico bancario, e carte di credito/debito tramite integrazione sicura. Supportiamo anche stablecoin USDC/USDT per pagamenti a bassa volatilità."
  },
  {
    id: 11,
    category: "Token e Pagamenti",
    question: "Come posso ritirare i miei fondi?",
    answer: "Vai alla sezione 'Wallet' del tuo account e seleziona 'Ritira'. Puoi ritirare in criptovaluta (BTC, ETH, USDT, XMR) o tramite bonifico bancario. I tempi di elaborazione variano da pochi minuti a 2-3 giorni lavorativi."
  },
  {
    id: 12,
    category: "Bounty e Ricompense",
    question: "Come funzionano i bounty?",
    answer: "I bounty sono task pubblicati dalla community che puoi completare per guadagnare token MYZ. Ogni bounty ha una descrizione, criteri di accettazione, e una ricompensa associata. Puoi trovarli nella sezione 'Bounty Board'."
  },
  {
    id: 13,
    category: "Bounty e Ricompense",
    question: "Come posso creare un bounty?",
    answer: "Vai alla sezione 'Bounty Board' e clicca su 'Crea Bounty'. Specifica titolo, descrizione, criteri di accettazione, scadenza e ricompensa in MYZ. Il bounty verrà pubblicato dopo la conferma."
  },
  {
    id: 14,
    category: "Bounty e Ricompense",
    question: "Cosa succede se un bounty non viene completato?",
    answer: "Se un bounty scade senza essere completato, la ricompensa viene restituita al creatore. Puoi anche estendere la scadenza o aumentare la ricompensa per attirare più partecipanti."
  },
  {
    id: 15,
    category: "Sicurezza e Privacy",
    question: "Come vengono protetti i miei dati?",
    answer: "Utilizziamo crittografia end-to-end per tutte le comunicazioni, autenticazione a due fattori (2FA), e memorizziamo i dati su server sicuri. I tuoi dati personali non vengono mai condivisi con terze parti senza il tuo consenso."
  },
  {
    id: 16,
    category: "Sicurezza e Privacy",
    question: "MyZubster è sicuro?",
    answer: "Sì. La piattaforma utilizza smart contract verificati, audit di sicurezza regolari, e protocolli di crittografia avanzati. Supportiamo anche l'autenticazione biometrica e wallet hardware per una sicurezza aggiuntiva."
  },
  {
    id: 17,
    category: "Sicurezza e Privacy",
    question: "Come funziona l'autenticazione a due fattori (2FA)?",
    answer: "Puoi attivare il 2FA dalle impostazioni del tuo account. Supportiamo app di autenticazione come Google Authenticator e Authy, oltre a chiavi di sicurezza hardware FIDO2."
  },
  {
    id: 18,
    category: "Sviluppatori e API",
    question: "MyZubster offre API pubbliche?",
    answer: "Sì, offriamo API RESTful pubbliche per sviluppatori. Puoi trovare la documentazione completa nella sezione 'API Docs'. Le API permettono di integrare MyZubster nelle tue applicazioni."
  },
  {
    id: 19,
    category: "Sviluppatori e API",
    question: "Come posso contribuire al progetto?",
    answer: "MyZubster è open source! Puoi contribuire tramite GitHub, completando bounty, segnalando bug, o proponendo miglioramenti. Visita la sezione 'Bounty' per vedere le opportunità disponibili."
  },
  {
    id: 20,
    category: "Sviluppatori e API",
    question: "Quali sono i limiti di rate delle API?",
    answer: "Le API pubbliche hanno un limite di 100 richieste al minuto per utente autenticato. Per applicazioni che richiedono limiti più alti, contatta il team per soluzioni personalizzate."
  },
  {
    id: 21,
    category: "Community",
    question: "Come posso contattare il supporto?",
    answer: "Puoi contattare il supporto tramite la chat integrata nella piattaforma, via email all'indirizzo support@myzubster.com, o unendoti al nostro canale Telegram ufficiale. Il team di supporto è disponibile 24/7."
  },
  {
    id: 22,
    category: "Community",
    question: "Esiste una community di MyZubster?",
    answer: "Sì! Puoi unirti alla nostra community su Telegram, Discord, e GitHub. Seguici anche su Twitter per restare aggiornato sulle ultime novità e sviluppi del progetto."
  },
  {
    id: 23,
    category: "Community",
    question: "Come posso segnalare un bug?",
    answer: "Se trovi un bug, puoi segnalarlo aprendo una issue su GitHub o contattando il supporto. I bug critici vengono ricompensati con bounty speciali. Grazie per aiutare a migliorare MyZubster!"
  },
  {
    id: 24,
    category: "Community",
    question: "Posso tradurre MyZubster nella mia lingua?",
    answer: "Assolutamente sì! Supportiamo contributi di traduzione. Contatta il team per unirti al programma di localizzazione. Le traduzioni complete sono ricompensate con token MYZ."
  },
  {
    id: 25,
    category: "Generale",
    question: "Quali browser sono supportati?",
    answer: "MyZubster supporta tutti i browser moderni: Chrome, Firefox, Safari, Edge, e Brave. Per una migliore esperienza, ti consigliamo di utilizzare l'ultima versione del tuo browser preferito."
  },
  {
    id: 26,
    category: "Generale",
    question: "MyZubster è disponibile su mobile?",
    answer: "La piattaforma è completamente responsive e funziona su tutti i dispositivi mobili. Un'app nativa per iOS e Android è in fase di sviluppo e sarà disponibile prossimamente."
  }
];

export default faqData;