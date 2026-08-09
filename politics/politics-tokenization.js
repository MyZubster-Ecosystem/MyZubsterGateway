/**
 * 🏛️ Politics Tokenization System
 * Tokenizzazione di partiti, rappresentanti, voti e governance
 */

class PoliticsTokenization {
  constructor() {
    this.parties = [];
    this.representatives = [];
    this.proposals = [];
    this.votes = [];
    this.governance = [];
    this.totalTokens = 0;
    
    this.initializePolitics();
  }

  // Inizializza la politica
  initializePolitics() {
    console.log('🏛️ Inizializzazione del Sistema Politico...');
    
    // Partiti
    this.createParty('Partito Democratico', 'Centro-sinistra', '#FF0000', 100);
    this.createParty('Forza Italia', 'Centro-destra', '#0088FF', 90);
    this.createParty('Movimento 5 Stelle', 'Movimento', '#FFD700', 80);
    this.createParty('Lega', 'Destra', '#008000', 70);
    this.createParty('Fratelli d\'Italia', 'Destra', '#0000FF', 60);
    this.createParty('Italia Viva', 'Centro', '#FF6600', 50);
    this.createParty('Azione', 'Centro', '#00A86B', 40);
    this.createParty('Sinistra Italiana', 'Sinistra', '#FF00FF', 30);
    
    // Rappresentanti
    this.createRepresentative('Elly Schlein', 'Partito Democratico', 'Segretaria', 150);
    this.createRepresentative('Matteo Salvini', 'Lega', 'Segretario', 130);
    this.createRepresentative('Giorgia Meloni', 'Fratelli d\'Italia', 'Presidente del Consiglio', 200);
    this.createRepresentative('Antonio Tajani', 'Forza Italia', 'Vice Presidente', 110);
    this.createRepresentative('Giuseppe Conte', 'Movimento 5 Stelle', 'Presidente', 120);
    this.createRepresentative('Matteo Renzi', 'Italia Viva', 'Senatore', 80);
    this.createRepresentative('Carlo Calenda', 'Azione', 'Segretario', 70);
    this.createRepresentative('Nicola Fratoianni', 'Sinistra Italiana', 'Segretario', 60);
    
    // Proposte di legge
    this.createProposal('Legge sul Reddito di Cittadinanza', 'Sociale', 'Approvata', 200);
    this.createProposal('Riforma della Giustizia', 'Giustizia', 'In discussione', 150);
    this.createProposal('Legge sulla Transizione Ecologica', 'Ambiente', 'In discussione', 180);
    this.createProposal('Riforma del Sistema Sanitario', 'Sanità', 'In commissione', 160);
    this.createProposal('Legge sul Lavoro Agile', 'Lavoro', 'Approvata', 120);
    this.createProposal('Riforma della Pubblica Amministrazione', 'Pubblica Amministrazione', 'In discussione', 140);
    this.createProposal('Legge sull\'Immigrazione', 'Immigrazione', 'In discussione', 130);
    
    // Governance
    this.createGovernance('Democrazia Diretta', 'Partecipativa', 'Attiva');
    this.createGovernance('Consiglio dei Ministri', 'Esecutivo', 'Attiva');
    this.createGovernance('Parlamento', 'Legislativo', 'Attiva');
    this.createGovernance('Senato', 'Legislativo', 'Attiva');
    
    this.totalTokens = this.parties.length + this.representatives.length + 
                       this.proposals.length + this.governance.length;
    
    console.log(`🏛️ Sistema Politico inizializzato: ${this.totalTokens} oggetti tokenizzati`);
  }

  // Crea partito
  createParty(name, orientation, color, members) {
    const party = {
      id: `party-${Date.now()}-${this.parties.length}`,
      name,
      orientation: orientation || 'Centro',
      color: color || '#FFFFFF',
      members: members || 0,
      status: 'tokenized',
      tokenId: `NFT-POL-PARTY-${String(this.parties.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.parties.push(party);
    return party;
  }

  // Crea rappresentante
  createRepresentative(name, party, role, influence) {
    const rep = {
      id: `rep-${Date.now()}-${this.representatives.length}`,
      name,
      party: party || 'Indipendente',
      role: role || 'Membro',
      influence: influence || 50,
      status: 'tokenized',
      tokenId: `NFT-POL-REP-${String(this.representatives.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.representatives.push(rep);
    return rep;
  }

  // Crea proposta
  createProposal(title, category, status, priority) {
    const proposal = {
      id: `proposal-${Date.now()}-${this.proposals.length}`,
      title,
      category: category || 'Generale',
      status: status || 'In discussione',
      priority: priority || 100,
      status: 'tokenized',
      tokenId: `NFT-POL-PROP-${String(this.proposals.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.proposals.push(proposal);
    return proposal;
  }

  // Crea governance
  createGovernance(name, type, status) {
    const gov = {
      id: `gov-${Date.now()}-${this.governance.length}`,
      name,
      type: type || 'Generale',
      status: status || 'Attiva',
      tokenId: `NFT-POL-GOV-${String(this.governance.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.governance.push(gov);
    return gov;
  }

  // Ottieni statistiche
  getStats() {
    return {
      parties: this.parties.length,
      representatives: this.representatives.length,
      proposals: this.proposals.length,
      governance: this.governance.length,
      total: this.totalTokens
    };
  }
}

module.exports = new PoliticsTokenization();
