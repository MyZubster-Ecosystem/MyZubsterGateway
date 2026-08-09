# Quadro Normativo MAS per Tokenizzazione — MyZubster Gateway

## Sommario Esecutivo

Questo documento analizza il quadro normativo della Monetary Authority of Singapore (MAS) per la tokenizzazione di asset reali (Real-World Assets, RWA), identificando i requisiti applicabili al token MYZ e al gateway MyZubster. L'obiettivo è fornire una guida pratica per garantire la conformità normativa del progetto.

---

## 1. Framework Normativi di Riferimento

### 1.1 Securities and Futures Act (SFA)

Il SFA regola le offerte di prodotti finanziari, inclusi i token che rappresentano titoli (security tokens).

**Requisiti chiave per MYZ:**
- **Prospetto**: Se il token MYZ rappresenta un prodotto di investimento collettivo (CIS), è richiesto un prospetto registrato presso MAS, salvo esenzioni.
- **Licenze**: Le piattaforme che facilitano lo scambio di security token necessitano di una licenza Recognised Market Operator (RMO) o Approved Exchange.
- **Custodia**: Gli asset dei clienti devono essere segregati e custoditi da un'entità autorizzata.

**Esenzioni applicabili:**
- **Small offers**: Offerte inferiori a SGD 5 milioni in 12 mesi
- **Investitori accreditati**: Offerte riservate a investitori accreditati (patrimonio > SGD 2M o reddito > SGD 300K/anno)
- **Offerte private**: Massimo 50 investitori in 12 mesi

### 1.2 Payment Services Act (PS Act)

Il PS Act regola i servizi di pagamento, inclusi i token di pagamento digitali (DPT).

**Classificazione dei servizi:**
| Servizio | Descrizione | Applicabile a MYZ? |
|----------|-------------|---------------------|
| Account issuance | Emissione di conti di pagamento | ❌ (salvo wallet custodial) |
| Domestic money transfer | Trasferimento domestico | ❌ |
| Cross-border money transfer | Trasferimento transfrontaliero | ✅ (se gateway scambia MYZ) |
| Merchant acquisition | Acquisizione commercianti | ✅ (se marketplace) |
| DPT service | Scambio/portafoglio DPT | ✅ (se MYZ è DPT) |
| E-money issuance | Emissione moneta elettronica | ❌ |

**Licenze richieste:**
- **Standard Payment Institution (SPI)**: Volume mensile < SGD 3M (DPT) o < SGD 6M (altri)
- **Major Payment Institution (MPI)**: Sopra le soglie SPI
- **Money-Changing Licence**: Solo cambio valuta fiat

**Raccomandazione per MyZubster:** Richiedere licenza SPI per DPT service se il volume MYZ rimane sotto soglia.

### 1.3 Project Guardian

Iniziativa MAS per esplorare la tokenizzazione di asset in collaborazione con l'industria finanziaria.

**Pilastri di Project Guardian:**
1. **Asset & Wealth Management** — Tokenizzazione di fondi e prodotti strutturati
2. **Fixed Income** — Obbligazioni e strumenti di debito tokenizzati
3. **Foreign Exchange** — FX e pagamenti transfrontalieri tokenizzati
4. **Asset-Backed Tokens** — Asset reali (immobili, robot, infrastrutture)

**Implicazioni per MYZ:**
- **Allineamento**: Il token MYZ con backing in asset reali (robot, proprietà) si allinea perfettamente con il pilastro 4
- **Sandbox**: Possibilità di partecipare alla MAS Regulatory Sandbox per testare il modello
- **Best practices**: Adottare gli standard sviluppati dai pilot Project Guardian (es. Guardian Fixed Income, Guardian Funds)

---

## 2. Mappatura dei Requisiti

### 2.1 Requisiti KYC/AML

| Requisito | Fonte | Implementazione MyZubster |
|-----------|-------|---------------------------|
| Customer Due Diligence (CDD) | MAS Notice 626 | ✅ Verifica identità al momento del wallet registration |
| Enhanced CDD per PEP | MAS Notice 626 | ✅ Screening list PEP/sanzioni |
| Transaction monitoring | PS Act §18 | ✅ Monitoraggio real-time transazioni MYZ/XMR |
| Suspicious Transaction Report (STR) | CDSA §39 | ✅ Invio STR a STRO entro 24h |
| Record keeping (5 anni) | PS Act §22 | ✅ Archiviazione transazioni e KYC |
| Travel Rule (dal 2024) | FATF Rec. 16 | ✅ Trasmissione dati originator/beneficiary per transazioni > SGD 1,500 |

### 2.2 Requisiti Tecnici

| Requisito | Standard | Implementazione |
|-----------|----------|-----------------|
| Cybersecurity | MAS TRM Guidelines | Crittografia, penetration testing, audit |
| Business continuity | MAS BCM Guidelines | RPO < 4h, RTO < 24h |
| Data protection | PDPA | GDPR-compatible, data localization Singapore |
| Smart contract audit | Industry best practice | Audit esterno, verifica formale |

### 2.3 Requisiti di Governance

- **Board oversight**: Consiglio responsabile compliance
- **Risk management framework**: ERM con focus su rischi DPT
- **Internal audit**: Audit annuale indipendente
- **Compliance officer**: Nominare un MLRO (Money Laundering Reporting Officer)

---

## 3. Token di Proprietà (Robot, Immobili)

### 3.1 Natura Giuridica

Il token MYZ che rappresenta la proprietà frazionata di robot o immobili può essere classificato come:

| Classificazione | Implicazioni |
|-----------------|--------------|
| **Security token** (SFA) | Richiede prospetto o esenzione; licenza RMO per scambio |
| **Asset-backed token** (Project Guardian) | Nuova categoria in evoluzione; sandbox MAS raccomandata |
| **Utility token** | Meno regolamentato ma rischi di riclassificazione |

### 3.2 Struttura Raccomandata

```
┌─────────────────────────────────────────────────┐
│                Special Purpose Vehicle (SPV)     │
│  (Singapore Private Limited)                     │
│                                                   │
│  ┌─────────┐    ┌─────────┐    ┌──────────────┐ │
│  │ Robot   │    │ Immobile│    │ Altri Asset  │ │
│  │ Token   │    │ Token   │    │ Token        │ │
│  └────┬────┘    └────┬────┘    └──────┬───────┘ │
│       │              │                │          │
│       └──────────────┼────────────────┘          │
│                      │                            │
│               ┌──────▼──────┐                     │
│               │  MYZ Token  │                     │
│               │ (fungibile) │                     │
│               └─────────────┘                     │
└─────────────────────────────────────────────────┘
```

**Vantaggi SPV:**
- Separazione legale degli asset dal gateway operativo
- Chiaro quadro di proprietà per i token holders
- Conformità SFA facilitata (l'SPV emette security token)

---

## 4. Esenzioni per Investitori Accreditati

### 4.1 Criteri MAS

| Criterio | Soglia |
|----------|--------|
| Patrimonio netto personale | > SGD 2,000,000 |
| Reddito annuo | > SGD 300,000 |
| Patrimonio finanziario netto | > SGD 1,000,000 |
| Istituzionale | Banche, fondi, assicurazioni, ecc. |

### 4.2 Applicazione a MyZubster

- **Fase 1 — Investitori accreditati**: Limitare le prime emissioni di token (robot, immobili) a investitori accreditati
- **Fase 2 — Small offers**: Utilizzare l'esenzione small offers (< SGD 5M) per aperture retail graduali
- **Fase 3 — Licenza RMO**: Richiedere licenza completa quando il volume lo giustifica

---

## 5. Roadmap di Compliance

| Fase | Durata | Attività |
|------|--------|----------|
| **Fase 1** | Mese 1-3 | Legal opinion, struttura SPV, policy KYC/AML |
| **Fase 2** | Mese 3-6 | Richiesta esenzione/sandbox MAS, audit smart contract |
| **Fase 3** | Mese 6-12 | Licenza SPI (DPT service), sistema transaction monitoring |
| **Fase 4** | Mese 12-24 | Licenza RMO (se scambio secondario), audit esterno |

---

## 6. Raccomandazioni Finali

1. **Costituire un SPV a Singapore** per l'emissione di token garantiti da asset reali
2. **Richiedere l'ingresso nella MAS Regulatory Sandbox** per testare il modello con supervisione
3. **Limitare le emissioni iniziali a investitori accreditati** usando l'esenzione SFA
4. **Implementare KYC/AML completo** prima del lancio (CDD, screening, transaction monitoring)
5. **Preparare la domanda di licenza SPI** per il servizio DPT quando i volumi crescono
6. **Allinearsi ai pilot Project Guardian** per adottare standard riconosciuti da MAS

---

## Riferimenti

- [MAS Securities and Futures Act](https://sso.agc.gov.sg/Act/SFA2001)
- [MAS Payment Services Act 2019](https://sso.agc.gov.sg/Act/PSA2019)
- [Project Guardian — MAS](https://www.mas.gov.sg/schemes-and-initiatives/project-guardian)
- [MAS Notice 626 — AML/CFT](https://www.mas.gov.sg/regulation/notices/notice-626)
- [MAS TRM Guidelines](https://www.mas.gov.sg/regulation/guidelines/technology-risk-management-guidelines)

---

📄 Documento preparato per MyZubster Gateway — Bounty #358
Data: 9 Agosto 2026
Autore: @laurentketterle-hub
