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

## 💰 Ricompensa e Settlement

Le ricompense sono denominate in **$MYZ** e seguono il modello canonico:

```text
issue/claim
→ implementation
→ review
→ VERIFIED / REJECTED
→ REWARD_RECORDED (se applicabile)
→ SETTLEMENT_PENDING / SETTLED (solo se applicabile e indipendentemente evidenziato)
```

**Importante:** Il merge della PR o la chiusura dell'issue **non** costituiscono prova di finanziamento o pagamento. La ricompensa viene registrata (`REWARD_RECORDED`) solo dopo verifica (`VERIFIED`). Il settlement esterno (`SETTLEMENT_PENDING`/`SETTLED`) richiede evidenza indipendente di finanziamento.

- **Stato finanziamento:** indicato nell'issue (es. `funded`, `unfunded`, `proposed`)
- **Registro ricompense:** vedi [REWARDS_LEDGER.md](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/REWARDS_LEDGER.md)
- **Regole complete:** vedi [BOUNTIES.md](https://github.com/MyZubster-Ecosystem/myzubster/blob/main/BOUNTIES.md)

---

## 📋 Template per nuovi bounty

I nuovi bounty devono includere:
- `reward`: importo in MYZ
- `rail`: canale di pagamento (es. Tari)
- `funding_state`: `funded` | `unfunded` | `proposed`
- `acceptance_criteria`: lista verificabile
- `verification`: come viene verificato il completamento
- `settlement_conditions`: condizioni per il settlement esterno
