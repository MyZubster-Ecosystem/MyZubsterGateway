class HistoryTokenization {
  constructor() {
    this.events = [];
    this.figures = [];
    this.civilizations = [];
    this.periods = [];
    this.monuments = [];
    this.battles = [];
    this.treaties = [];
    this.discoveries = [];
    this.initializeHistory();
  }

  initializeHistory() {
    // Eventi storici
    ['Caduta dell\'Impero Romano', 'Scoperta dell\'America', 'Rivoluzione Francese', 'Unità d\'Italia', 'Prima Guerra Mondiale', 'Seconda Guerra Mondiale', 'Sbarco sulla Luna'].forEach(e =>
      this.events.push({ name: e, year: Math.floor(Math.random()*2000+1000), tokenId: `NFT-HISTORY-EVENT-${String(this.events.length+1).padStart(3,'0')}` })
    );

    // Personaggi storici
    ['Giulio Cesare', 'Leonardo da Vinci', 'Napoleone Bonaparte', 'Garibaldi', 'Cristoforo Colombo', 'Galileo Galilei', 'Dante Alighieri', 'Michelangelo', 'Machiavelli', 'Marco Polo'].forEach(f =>
      this.figures.push({ name: f, era: 'Storico', tokenId: `NFT-HISTORY-FIGURE-${String(this.figures.length+1).padStart(3,'0')}` })
    );

    // Civiltà
    ['Egizia', 'Greca', 'Romana', 'Maya', 'Azzteca', 'Cinese', 'Indiana', 'Babilonese', 'Fenicia', 'Etrusca'].forEach(c =>
      this.civilizations.push({ name: c, period: 'Antica', tokenId: `NFT-HISTORY-CIV-${String(this.civilizations.length+1).padStart(3,'0')}` })
    );

    // Periodi
    ['Preistoria', 'Antica Roma', 'Medioevo', 'Rinascimento', 'Barocco', 'Illuminismo', 'Rivoluzione Industriale', 'Età Contemporanea'].forEach(p =>
      this.periods.push({ name: p, tokenId: `NFT-HISTORY-PERIOD-${String(this.periods.length+1).padStart(3,'0')}` })
    );

    // Monumenti
    ['Colosseo', 'Piramidi', 'Muro di Berlino', 'Torre di Pisa', 'Pompei', 'Acropoli', 'Stonehenge', 'Machu Picchu'].forEach(m =>
      this.monuments.push({ name: m, tokenId: `NFT-HISTORY-MONUMENT-${String(this.monuments.length+1).padStart(3,'0')}` })
    );

    // Battaglie
    ['Maratona', 'Alessandro contro Dario', 'Canne', 'Azio', 'Legnano', 'Lepanto', 'Waterloo', 'Stalingrado'].forEach(b =>
      this.battles.push({ name: b, tokenId: `NFT-HISTORY-BATTLE-${String(this.battles.length+1).padStart(3,'0')}` })
    );

    // Trattati
    ['Pace di Westfalia', 'Trattato di Versailles', 'Trattato di Roma', 'Trattato di Tordesillas', 'Pace di Vienna'].forEach(t =>
      this.treaties.push({ name: t, year: Math.floor(Math.random()*500+1500), tokenId: `NFT-HISTORY-TREATY-${String(this.treaties.length+1).padStart(3,'0')}` })
    );

    // Scoperte
    ['Scrittura', 'Ruota', 'Vulcanizzazione', 'Telefono', 'Elettricità', 'Penicillina', 'Radar', 'Internet'].forEach(d =>
      this.discoveries.push({ name: d, tokenId: `NFT-HISTORY-DISCOVERY-${String(this.discoveries.length+1).padStart(3,'0')}` })
    );
  }

  getStats() {
    return {
      events: this.events.length,
      figures: this.figures.length,
      civilizations: this.civilizations.length,
      periods: this.periods.length,
      monuments: this.monuments.length,
      battles: this.battles.length,
      treaties: this.treaties.length,
      discoveries: this.discoveries.length,
      total: this.events.length + this.figures.length + this.civilizations.length + this.periods.length + this.monuments.length + this.battles.length + this.treaties.length + this.discoveries.length
    };
  }
}
module.exports = new HistoryTokenization();
