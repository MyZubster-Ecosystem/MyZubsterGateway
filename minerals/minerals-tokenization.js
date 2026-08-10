class MineralsTokenization {
  constructor() {
    this.precious = []; this.gemstones = []; this.rare_earth = []; this.industrial = [];
    ['Oro','Argento','Platino','Palladio','Rodio','Iridio','Osmio','Rutenio'].forEach(m =>
      this.precious.push({ name: m, value: Math.floor(Math.random()*5000+1000), tokenId: `NFT-MINERAL-PRECIOUS-${String(this.precious.length+1).padStart(3,'0')}` })
    );
    ['Diamante','Smeraldo','Rubino','Zaffiro','Opale','Topazio','Ametista','Giada'].forEach(g =>
      this.gemstones.push({ name: g, carat: (Math.random()*10+1).toFixed(1), tokenId: `NFT-MINERAL-GEMSTONE-${String(this.gemstones.length+1).padStart(3,'0')}` })
    );
    ['Neodimio','Lantanio','Cerio','Praseodimio','Samario','Gadolinio','Disprosio','Erbio'].forEach(r =>
      this.rare_earth.push({ name: r, application: 'Tecnologia', tokenId: `NFT-MINERAL-RARE-${String(this.rare_earth.length+1).padStart(3,'0')}` })
    );
    ['Quarzo','Feldspato','Calcite','Gesso','Talco','Mica','Grafite','Zircone'].forEach(i =>
      this.industrial.push({ name: i, use: 'Industriale', tokenId: `NFT-MINERAL-INDUSTRIAL-${String(this.industrial.length+1).padStart(3,'0')}` })
    );
  }
  getStats() {
    return {
      precious: this.precious.length, gemstones: this.gemstones.length,
      rare_earth: this.rare_earth.length, industrial: this.industrial.length,
      total: this.precious.length + this.gemstones.length + this.rare_earth.length + this.industrial.length
    };
  }
}
module.exports = new MineralsTokenization();
