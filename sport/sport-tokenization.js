class SportTokenization {
  constructor() {
    this.teams = []; this.athletes = []; this.stadia = []; this.events = [];
    ['Juventus','Milan','Inter','Roma','Napoli','Fiorentina','Lazio','Atalanta'].forEach(t =>
      this.teams.push({ name: t, sport: 'Calcio', country: 'Italia', tokenId: `NFT-SPORT-TEAM-${String(this.teams.length+1).padStart(3,'0')}` })
    );
    ['Messi','Ronaldo','Neymar','Mbappé','Haaland','Lewandowski','Salah','Vinicius'].forEach(a =>
      this.athletes.push({ name: a, sport: 'Calcio', country: 'Mondo', tokenId: `NFT-SPORT-ATHLETE-${String(this.athletes.length+1).padStart(3,'0')}` })
    );
    ['San Siro','Allianz Stadium','Olimpico','Maradona','Wembley','Camp Nou','Bernabeu'].forEach(s =>
      this.stadia.push({ name: s, capacity: Math.floor(Math.random()*50000+30000), tokenId: `NFT-SPORT-STADIUM-${String(this.stadia.length+1).padStart(3,'0')}` })
    );
    ['Mondiale 2026','Europei 2024','Champions League Finale','Coppa Italia'].forEach(e =>
      this.events.push({ name: e, year: 2026, tokenId: `NFT-SPORT-EVENT-${String(this.events.length+1).padStart(3,'0')}` })
    );
  }
  getStats() { return { teams: this.teams.length, athletes: this.athletes.length, stadia: this.stadia.length, events: this.events.length, total: this.teams.length+this.athletes.length+this.stadia.length+this.events.length }; }
}
module.exports = new SportTokenization();
