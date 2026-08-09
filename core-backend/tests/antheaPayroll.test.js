// tests/antheaPayroll.test.js - Test per Sistema Payroll Anthea
const {
  calcolaIrpef,
  calcolaDetrazioniLavoro,
  generaCedolino,
  reportMensile,
  db, Dipendente, Cedolino
} = require('../services/antheaPayrollService');

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('Anthea Payroll Service', () => {
  let dipendente;

  beforeAll(async () => {
    dipendente = await Dipendente.create({
      nome: 'Mario',
      cognome: 'Rossi',
      codiceFiscale: 'RSSMRA80A01H501Z',
      dataNascita: '1980-01-01',
      dataAssunzione: '2023-01-01',
      ral: 30000,
      email: 'mario.rossi@example.com',
      iban: 'IT60X0542811101000000123456'
    });
  });

  test('calcola IRPEF correttamente per scaglioni', () => {
    expect(calcolaIrpef(10000)).toBe(2300);   // 23% su 10k
    expect(calcolaIrpef(25000)).toBeGreaterThan(5000); // 23+25%
    expect(calcolaIrpef(50000)).toBeGreaterThan(12000);
  });

  test('calcola detrazioni lavoro dipendente', () => {
    const detrazioni10k = calcolaDetrazioniLavoro(10000);
    expect(detrazioni10k).toBeGreaterThan(0);

    const detrazioni60k = calcolaDetrazioniLavoro(60000);
    expect(detrazioni60k).toBe(0); // Oltre 50k = 0 detrazioni
  });

  test('genera cedolino con tutti i calcoli fiscali', async () => {
    const cedolino = await generaCedolino(dipendente.id, 6, 2024);

    expect(cedolino).toBeDefined();
    expect(cedolino.dipendenteId).toBe(dipendente.id);
    expect(cedolino.mese).toBe(6);
    expect(cedolino.anno).toBe(2024);
    expect(cedolino.retribuzioneLorda).toBeGreaterThan(0);
    expect(cedolino.contributiINPS).toBeGreaterThan(0);
    expect(cedolino.irpefLorda).toBeGreaterThan(0);
    expect(cedolino.nettoInBusta).toBeGreaterThan(0);
    expect(cedolino.nettoInBusta).toBeLessThan(cedolino.retribuzioneLorda); // netto < lordo

    // Verifica che netto = lordo - inps - irpef - addizionali
    const nettoCalcolato = cedolino.retribuzioneLorda
      - cedolino.contributiINPS
      - cedolino.irpefNetta
      - cedolino.addizionaleRegionale
      - cedolino.addizionaleComunale;
    expect(Math.abs(cedolino.nettoInBusta - nettoCalcolato)).toBeLessThan(0.02);
  });

  test('genera pagamento e F24 automaticamente', async () => {
    const { Pagamento, F24 } = require('../services/antheaPayrollService');
    const cedolino = await generaCedolino(dipendente.id, 7, 2024);

    const pagamento = await Pagamento.findOne({ where: { cedolinoId: cedolino.id } });
    expect(pagamento).toBeDefined();
    expect(pagamento.stato).toBe('in_attesa');
    expect(pagamento.importo).toBe(cedolino.nettoInBusta);

    const f24 = await F24.findOne({ where: { cedolinoId: cedolino.id } });
    expect(f24).toBeDefined();
    expect(f24.importoTotale).toBeGreaterThan(0);
  });

  test('report mensile con aggregazioni corrette', async () => {
    const report = await reportMensile(6, 2024);

    expect(report.mese).toBe(6);
    expect(report.anno).toBe(2024);
    expect(report.dipendentiElaborati).toBeGreaterThan(0);
    expect(report.totaleLordo).toBeGreaterThan(0);
    expect(report.totaleNetto).toBeGreaterThan(0);
    expect(report.totaleNetto).toBeLessThan(report.totaleLordo);
    expect(report.dettaglio.length).toBeGreaterThan(0);
  });
});
