/**
 * 🌌 Universe Tokenization System
 * Tokenizzazione di galassie, stelle, pianeti e fenomeni cosmici
 */

class UniverseTokenization {
  constructor() {
    this.galaxies = [];
    this.stars = [];
    this.planets = [];
    this.nebulae = [];
    this.blackholes = [];
    this.constellations = [];
    this.cosmicEvents = [];
    this.totalTokens = 0;
    
    this.initializeUniverse();
  }

  // Inizializza l'universo con dati reali
  initializeUniverse() {
    console.log('🌌 Inizializzazione dell\'Universo...');
    
    // Galassie principali
    this.createGalaxy('Andromeda', 2.537, 1000000000000, 'Spirale');
    this.createGalaxy('Via Lattea', 1.5, 400000000000, 'Spirale Barrata');
    this.createGalaxy('Triangolo', 2.73, 40000000000, 'Spirale');
    this.createGalaxy('Sombrero', 29.3, 100000000000, 'Ellittica');
    this.createGalaxy('Whirlpool', 23, 100000000000, 'Spirale');
    
    // Stelle famose
    this.createStar('Sole', 'G2V', 1, 'Via Lattea', true);
    this.createStar('Sirio', 'A1V', 2.02, 'Via Lattea');
    this.createStar('Betelgeuse', 'M1-2Iab', 15, 'Via Lattea');
    this.createStar('Polaris', 'F7Iab', 5.4, 'Via Lattea');
    this.createStar('Alpha Centauri', 'G2V', 1.1, 'Via Lattea');
    
    // Pianeti
    this.createPlanet('Terra', 'Terrestre', 1, 'Sole', 'Via Lattea', true);
    this.createPlanet('Marte', 'Terrestre', 0.53, 'Sole', 'Via Lattea');
    this.createPlanet('Giove', 'Gassoso', 318, 'Sole', 'Via Lattea');
    this.createPlanet('Saturno', 'Gassoso', 95, 'Sole', 'Via Lattea');
    this.createPlanet('Kepler-452b', 'Super-Terra', 1.63, 'Kepler-452', 'Via Lattea');
    
    // Nebulose
    this.createNebula('Orione', 'Diffusa', 24, 'Via Lattea');
    this.createNebula('Granchio', 'Supernova', 11, 'Via Lattea');
    this.createNebula('Laguna', 'Diffusa', 26, 'Via Lattea');
    
    // Buchi neri
    this.createBlackHole('Sagittarius A*', 4.3e6, 'Via Lattea');
    this.createBlackHole('M87*', 6.5e9, 'M87');
    
    // Costellazioni
    this.createConstellation('Orsa Maggiore', ['Dubhe', 'Merak', 'Phecda', 'Megrez', 'Alioth', 'Mizar', 'Alkaid']);
    this.createConstellation('Orione', ['Betelgeuse', 'Rigel', 'Bellatrix', 'Saiph', 'Mintaka', 'Alnilam', 'Alnitak']);
    this.createConstellation('Cassiopeia', ['Schedar', 'Caph', 'Ruchbah', 'Segin', 'Navi']);
    
    this.totalTokens = this.galaxies.length + this.stars.length + this.planets.length + 
                       this.nebulae.length + this.blackholes.length + this.constellations.length;
    
    console.log(`🌌 Universo inizializzato: ${this.totalTokens} oggetti tokenizzati`);
  }

  // Crea galassia
  createGalaxy(name, distance, stars, type) {
    const galaxy = {
      id: `galaxy-${Date.now()}-${this.galaxies.length}`,
      name,
      distance: `${distance} milioni di anni luce`,
      stars,
      type: type || 'Spirale',
      status: 'tokenized',
      tokenId: `NFT-GALAXY-${String(this.galaxies.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.galaxies.push(galaxy);
    return galaxy;
  }

  // Crea stella
  createStar(name, spectral, mass, galaxy, isSun = false) {
    const star = {
      id: `star-${Date.now()}-${this.stars.length}`,
      name,
      spectral: spectral || 'G2V',
      mass: `${mass} masse solari`,
      galaxy,
      isSun,
      status: 'tokenized',
      tokenId: `NFT-STAR-${String(this.stars.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.stars.push(star);
    return star;
  }

  // Crea pianeta
  createPlanet(name, type, mass, star, galaxy, isEarth = false) {
    const planet = {
      id: `planet-${Date.now()}-${this.planets.length}`,
      name,
      type: type || 'Terrestre',
      mass: `${mass} masse terrestri`,
      star,
      galaxy,
      isEarth,
      status: 'tokenized',
      tokenId: `NFT-PLANET-${String(this.planets.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.planets.push(planet);
    return planet;
  }

  // Crea nebulosa
  createNebula(name, type, distance, galaxy) {
    const nebula = {
      id: `nebula-${Date.now()}-${this.nebulae.length}`,
      name,
      type: type || 'Diffusa',
      distance: `${distance} milioni di anni luce`,
      galaxy,
      status: 'tokenized',
      tokenId: `NFT-NEBULA-${String(this.nebulae.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.nebulae.push(nebula);
    return nebula;
  }

  // Crea buco nero
  createBlackHole(name, mass, galaxy) {
    const blackHole = {
      id: `blackhole-${Date.now()}-${this.blackholes.length}`,
      name,
      mass: `${mass} masse solari`,
      galaxy,
      status: 'tokenized',
      tokenId: `NFT-BLACKHOLE-${String(this.blackholes.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.blackholes.push(blackHole);
    return blackHole;
  }

  // Crea costellazione
  createConstellation(name, stars) {
    const constellation = {
      id: `constellation-${Date.now()}-${this.constellations.length}`,
      name,
      stars: stars || [],
      status: 'tokenized',
      tokenId: `NFT-CONSTELLATION-${String(this.constellations.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.constellations.push(constellation);
    return constellation;
  }

  // Ottieni statistiche
  getStats() {
    return {
      galaxies: this.galaxies.length,
      stars: this.stars.length,
      planets: this.planets.length,
      nebulae: this.nebulae.length,
      blackholes: this.blackholes.length,
      constellations: this.constellations.length,
      total: this.totalTokens
    };
  }

  // Genera report completo
  generateReport() {
    return {
      stats: this.getStats(),
      galaxies: this.galaxies,
      stars: this.stars,
      planets: this.planets,
      nebulae: this.nebulae,
      blackholes: this.blackholes,
      constellations: this.constellations
    };
  }
}

module.exports = new UniverseTokenization();
