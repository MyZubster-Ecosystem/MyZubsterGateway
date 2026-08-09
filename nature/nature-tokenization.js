/**
 * 🌿 Nature Tokenization System
 * Tokenizzazione di animali, piante e ecosistemi
 */

class NatureTokenization {
  constructor() {
    this.animals = [];
    this.plants = [];
    this.ecosystems = [];
    this.conservation = [];
    this.totalTokens = 0;
    
    this.initializeNature();
  }

  initializeNature() {
    console.log('🌿 Inizializzazione del Sistema Natura...');
    
    // Animali domestici
    this.createAnimal('Cane', 'Domestico', 'Mammifero', 100, 'Famiglia');
    this.createAnimal('Gatto', 'Domestico', 'Mammifero', 90, 'Famiglia');
    this.createAnimal('Cavallo', 'Domestico', 'Mammifero', 80, 'Lavoro');
    this.createAnimal('Mucca', 'Domestico', 'Mammifero', 70, 'Alimentazione');
    this.createAnimal('Pecora', 'Domestico', 'Mammifero', 60, 'Alimentazione');
    this.createAnimal('Maiale', 'Domestico', 'Mammifero', 50, 'Alimentazione');
    
    // Animali selvatici
    this.createAnimal('Leone', 'Selvatico', 'Mammifero', 150, 'Africa');
    this.createAnimal('Tigre', 'Selvatico', 'Mammifero', 140, 'Asia');
    this.createAnimal('Elefante', 'Selvatico', 'Mammifero', 130, 'Africa');
    this.createAnimal('Giraffa', 'Selvatico', 'Mammifero', 120, 'Africa');
    this.createAnimal('Orso', 'Selvatico', 'Mammifero', 110, 'Europa');
    this.createAnimal('Lupo', 'Selvatico', 'Mammifero', 100, 'Europa');
    this.createAnimal('Aquila', 'Selvatico', 'Uccello', 90, 'Montagne');
    this.createAnimal('Delfino', 'Selvatico', 'Mammifero', 130, 'Oceano');
    this.createAnimal('Balena', 'Selvatico', 'Mammifero', 160, 'Oceano');
    
    // Piante e alberi
    this.createPlant('Quercia', 'Albero', 200, 'Europa');
    this.createPlant('Pino', 'Albero', 180, 'Europa');
    this.createPlant('Abete', 'Albero', 160, 'Montagne');
    this.createPlant('Olivo', 'Albero', 150, 'Mediterraneo');
    this.createPlant('Vite', 'Pianta', 120, 'Mediterraneo');
    this.createPlant('Rosa', 'Fiore', 100, 'Mondo');
    this.createPlant('Girasole', 'Fiore', 90, 'Mondo');
    this.createPlant('Bambù', 'Pianta', 80, 'Asia');
    this.createPlant('Palma', 'Albero', 110, 'Tropicale');
    this.createPlant('Sequoia', 'Albero', 220, 'America');
    
    // Ecosistemi
    this.createEcosystem('Foresta Amazzonica', 'Foresta', 300);
    this.createEcosystem('Barriera Corallina', 'Marino', 250);
    this.createEcosystem('Savana Africana', 'Prateria', 200);
    this.createEcosystem('Alpi', 'Montagna', 180);
    this.createEcosystem('Mare Mediterraneo', 'Marino', 160);
    this.createEcosystem('Deserto del Sahara', 'Deserto', 140);
    
    // Conservazione
    this.createConservation('Riserva Naturale', 'Parco Nazionale', 100);
    this.createConservation('Area Protetta', 'Conservazione', 80);
    this.createConservation('Santuario Animali', 'Protezione', 70);
    
    this.totalTokens = this.animals.length + this.plants.length + 
                       this.ecosystems.length + this.conservation.length;
    
    console.log(`🌿 Sistema Natura inizializzato: ${this.totalTokens} oggetti tokenizzati`);
  }

  createAnimal(name, type, species, rarity, habitat) {
    const animal = {
      id: `animal-${Date.now()}-${this.animals.length}`,
      name,
      type: type || 'Selvatico',
      species: species || 'Mammifero',
      rarity: rarity || 50,
      habitat: habitat || 'Mondo',
      status: 'tokenized',
      tokenId: `NFT-NATURE-ANIMAL-${String(this.animals.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.animals.push(animal);
    return animal;
  }

  createPlant(name, type, age, region) {
    const plant = {
      id: `plant-${Date.now()}-${this.plants.length}`,
      name,
      type: type || 'Pianta',
      age: age || 100,
      region: region || 'Mondo',
      status: 'tokenized',
      tokenId: `NFT-NATURE-PLANT-${String(this.plants.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.plants.push(plant);
    return plant;
  }

  createEcosystem(name, type, biodiversity) {
    const ecosystem = {
      id: `ecosystem-${Date.now()}-${this.ecosystems.length}`,
      name,
      type: type || 'Naturale',
      biodiversity: biodiversity || 100,
      status: 'tokenized',
      tokenId: `NFT-NATURE-ECO-${String(this.ecosystems.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.ecosystems.push(ecosystem);
    return ecosystem;
  }

  createConservation(name, type, importance) {
    const conservation = {
      id: `conservation-${Date.now()}-${this.conservation.length}`,
      name,
      type: type || 'Protezione',
      importance: importance || 50,
      status: 'tokenized',
      tokenId: `NFT-NATURE-CONS-${String(this.conservation.length + 1).padStart(3, '0')}`,
      createdAt: new Date()
    };
    this.conservation.push(conservation);
    return conservation;
  }

  getStats() {
    return {
      animals: this.animals.length,
      plants: this.plants.length,
      ecosystems: this.ecosystems.length,
      conservation: this.conservation.length,
      total: this.totalTokens
    };
  }
}

module.exports = new NatureTokenization();
