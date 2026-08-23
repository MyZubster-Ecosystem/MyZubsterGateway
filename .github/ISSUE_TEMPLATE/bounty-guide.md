# 🏆 Guida ai Bounty – MyZubster Gateway

## Come funziona

I bounty sono ricompense in **$MYZ** (token su Tari) offerte per contributi al progetto. Ogni bounty ha una descrizione, criteri di accettazione e una ricompensa in MYZ.

---

## 🔍 Trovare un bounty

1. Vai alla [lista delle issue bounty](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/issues?q=label%3Abounty)
2. Cerca quelle con label `good first issue` per iniziare
3. Scegli quella che preferisci

---

## 📝 Reclamare un bounty

1. **Commenta** sull'issue: `I claim this bounty`
2. **Attendi** l'assegnazione (entro 24h)
3. **Apri una PR** entro 48 ore
4. **Collega** la PR all'issue: `Closes #NUMERO`

---

## ✅ Criteri di accettazione

Ogni bounty ha una lista di requisiti da soddisfare. In generale:

- **Codice funzionante** – passare tutti i test
- **Documentazione** – aggiornare README/API docs
- **Test** – aggiungere test per le nuove funzionalità
- **Qualità** – codice pulito, ben commentato

---

## 💰 Ricompensa e regolamento

Il merge o la chiusura dell'issue **non è mai prova di pagamento**. Il ciclo di vita di un bounty segue il modello canonico:

```
issue/claim → implementazione → review → VERIFIED / REJECTED
→ REWARD_RECORDED (se applicabile)
→ SETTLEMENT_PENDING / SETTLED (solo con evidenza indipendente)
```

- Dopo la review verificata, la ricompensa viene **registrata come reward record** sul ledger interno MYZ (`REWARD_RECORDED`).
- Il **regolamento esterno** (`SETTLED`) richiede un'evidenza di transazione indipendentemente verificabile (tx hash su explorer). Senza evidenza lo stato resta `SETTLEMENT_PENDING` o viene classificato `UNSETTLED`.
- Attualmente è in vigore un **freeze temporaneo dei payout (P0)**: nessun payout è dovuto finché non sono soddisfatti sia l'accettazione tecnica sia la verifica del regolamento.

**Riferimenti:**
- Regole bounty: [BOUNTIES.md](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/blob/main/BOUNTIES.md)
- Policy pagamenti: [docs/BOUNTY_PAYMENT_POLICY.md](https://github.com/MyZubster-Ecosystem/MyZubsterGateway/blob/main/docs/BOUNTY_PAYMENT_POLICY.md)
- Ledger canonico: [REWARDS_LEDGER.md](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/REWARDS_LEDGER.md)
