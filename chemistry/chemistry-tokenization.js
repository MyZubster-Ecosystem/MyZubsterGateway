class ChemistryTokenization {
  constructor() {
    this.elements = [];
    this.compounds = [];
    this.molecules = [];
    this.reactions = [];
    this.materials = [];
    this.discoveries = [];
    this.nobel = [];
    this.initializeChemistry();
  }

  initializeChemistry() {
    // Elementi chimici
    const elements = ['Idrogeno','Elio','Litio','Berillio','Boro','Carbonio','Azoto','Ossigeno','Fluoro','Neon',
                      'Sodio','Magnesio','Alluminio','Silicio','Fosforo','Zolfo','Cloro','Argon','Potassio','Calcio',
                      'Ferro','Rame','Oro','Argento','Platino','Uranio','Radio','Cesio','Francio','Oganesson'];
    elements.forEach(el => this.elements.push({ name: el, symbol: el.substring(0,2).toUpperCase(), number: this.elements.length+1, tokenId: `NFT-CHEM-ELEMENT-${String(this.elements.length+1).padStart(3,'0')}` }));

    // Composti famosi
    ['Acqua','Sale da cucina','Anidride carbonica','Ammoniaca','Acido solforico','Acido cloridrico','Metano','Etanolo','Glucosio','DNA'].forEach(c =>
      this.compounds.push({ name: c, formula: '--', tokenId: `NFT-CHEM-COMPOUND-${String(this.compounds.length+1).padStart(3,'0')}` })
    );

    // Molecole
    ['H₂O','NaCl','CO₂','NH₃','H₂SO₄','HCl','CH₄','C₂H₅OH','C₆H₁₂O₆','DNA'].forEach(m =>
      this.molecules.push({ name: m, tokenId: `NFT-CHEM-MOLECULE-${String(this.molecules.length+1).padStart(3,'0')}` })
    );

    // Reazioni
    ['Combustione','Fotosintesi','Ossidoriduzione','Idrolisi','Neutralizzazione','Polimerizzazione','Fermentazione'].forEach(r =>
      this.reactions.push({ name: r, tokenId: `NFT-CHEM-REACTION-${String(this.reactions.length+1).padStart(3,'0')}` })
    );

    // Materiali
    ['Plastica','Acciaio','Vetro','Gomma','Ceramica','Carbonio','Silicio','Nylon'].forEach(m =>
      this.materials.push({ name: m, tokenId: `NFT-CHEM-MATERIAL-${String(this.materials.length+1).padStart(3,'0')}` })
    );

    // Scoperte
    ['Tavola periodica','Radioattività','Struttura DNA','Penicillina','Sintesi ammoniaca','Plastica','Celle solari'].forEach(d =>
      this.discoveries.push({ name: d, tokenId: `NFT-CHEM-DISCOVERY-${String(this.discoveries.length+1).padStart(3,'0')}` })
    );

    // Premi Nobel
    ['Marie Curie','Linus Pauling','Dorothy Hodgkin','Ernest Rutherford','Dmitri Mendeleev','Antoine Lavoisier','Alfred Nobel'].forEach(n =>
      this.nobel.push({ name: n, tokenId: `NFT-CHEM-NOBEL-${String(this.nobel.length+1).padStart(3,'0')}` })
    );
  }

  getStats() {
    return {
      elements: this.elements.length,
      compounds: this.compounds.length,
      molecules: this.molecules.length,
      reactions: this.reactions.length,
      materials: this.materials.length,
      discoveries: this.discoveries.length,
      nobel: this.nobel.length,
      total: this.elements.length + this.compounds.length + this.molecules.length + this.reactions.length + this.materials.length + this.discoveries.length + this.nobel.length
    };
  }
}
module.exports = new ChemistryTokenization();
