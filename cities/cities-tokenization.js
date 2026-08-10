class CitiesTokenization {
  constructor() {
    this.landmarks = []; this.monuments = []; this.squares = []; this.buildings = [];
    ['Colosseo','Torre Eiffel','Big Ben','Ponte Vecchio','Guglia di Giotto'].forEach(l =>
      this.landmarks.push({ name: l, tokenId: `NFT-CITY-LANDMARK-${String(this.landmarks.length+1).padStart(3,'0')}` })
    );
    ['Fontana di Trevi','Statua della Libertà','Piazza San Marco','Piazza del Campo'].forEach(m =>
      this.monuments.push({ name: m, tokenId: `NFT-CITY-MONUMENT-${String(this.monuments.length+1).padStart(3,'0')}` })
    );
    ['Piazza San Pietro','Piazza Navona','Piazza della Signoria','Piazza Maggiore'].forEach(s =>
      this.squares.push({ name: s, tokenId: `NFT-CITY-SQUARE-${String(this.squares.length+1).padStart(3,'0')}` })
    );
    ['Duomo di Milano','Cattedrale di Firenze','Palazzo Ducale','Torre degli Asinelli'].forEach(b =>
      this.buildings.push({ name: b, tokenId: `NFT-CITY-BUILDING-${String(this.buildings.length+1).padStart(3,'0')}` })
    );
  }
  getStats() { return { landmarks: this.landmarks.length, monuments: this.monuments.length, squares: this.squares.length, buildings: this.buildings.length, total: this.landmarks.length+this.monuments.length+this.squares.length+this.buildings.length }; }
}
module.exports = new CitiesTokenization();
