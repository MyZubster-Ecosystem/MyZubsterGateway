// Nature Tokenization Module - MyZubster Ecosystem
// Closes #1224

const NATURE_REGISTRY = {
    animals: {
        domestic: [
            { id: "dog-001", name: "Cane", species: "Canis lupus familiaris", rarity: 3 },
            { id: "cat-001", name: "Gatto", species: "Felis catus", rarity: 3 },
            { id: "horse-001", name: "Cavallo", species: "Equus ferus caballus", rarity: 5 },
            { id: "cow-001", name: "Mucca", species: "Bos taurus", rarity: 4 },
            { id: "sheep-001", name: "Pecora", species: "Ovis aries", rarity: 2 },
            { id: "pig-001", name: "Maiale", species: "Sus scrofa domesticus", rarity: 2 }
        ],
        wild: [
            { id: "wolf-001", name: "Lupo", species: "Canis lupus", rarity: 8 },
            { id: "eagle-001", name: "Aquila reale", species: "Aquila chrysaetos", rarity: 9 },
            { id: "bear-001", name: "Orso bruno", species: "Ursus arctos", rarity: 9 },
            { id: "deer-001", name: "Cervo", species: "Cervus elaphus", rarity: 6 },
            { id: "fox-001", name: "Volpe", species: "Vulpes vulpes", rarity: 5 },
            { id: "dolphin-001", name: "Delfino", species: "Delphinus delphis", rarity: 8 },
            { id: "tiger-001", name: "Tigre", species: "Panthera tigris", rarity: 10 },
            { id: "elephant-001", name: "Elefante", species: "Loxodonta africana", rarity: 10 },
            { id: "whale-001", name: "Balena", species: "Balaenoptera musculus", rarity: 10 }
        ]
    },
    plants: [
        { id: "oak-001", name: "Quercia", species: "Quercus robur", rarity: 5 },
        { id: "olive-001", name: "Ulivo", species: "Olea europaea", rarity: 6 },
        { id: "pine-001", name: "Pino", species: "Pinus sylvestris", rarity: 4 },
        { id: "rose-001", name: "Rosa", species: "Rosa gallica", rarity: 3 },
        { id: "lavender-001", name: "Lavanda", species: "Lavandula angustifolia", rarity: 3 },
        { id: "bamboo-001", name: "Bambu", species: "Bambusoideae", rarity: 4 },
        { id: "cactus-001", name: "Cactus Saguaro", species: "Carnegiea gigantea", rarity: 7 },
        { id: "sunflower-001", name: "Girasole", species: "Helianthus annuus", rarity: 2 },
        { id: "baobab-001", name: "Baobab", species: "Adansonia digitata", rarity: 9 },
        { id: "cherry-001", name: "Ciliegio", species: "Prunus avium", rarity: 4 }
    ],
    ecosystems: [
        { id: "forest-001", name: "Foresta Amazzonica", type: "rainforest", rarity: 10 },
        { id: "reef-001", name: "Barriera Corallina", type: "coral_reef", rarity: 10 },
        { id: "desert-001", name: "Deserto del Sahara", type: "desert", rarity: 8 },
        { id: "tundra-001", name: "Tundra Artica", type: "tundra", rarity: 9 },
        { id: "wetland-001", name: "Zone Umide", type: "wetland", rarity: 7 },
        { id: "mangrove-001", name: "Mangrovie", type: "mangrove", rarity: 8 }
    ],
    conservation: [
        { id: "park-001", name: "Parco Nazionale Yellowstone", area: "8,983 km2", rarity: 9 },
        { id: "reserve-001", name: "Riserva Masai Mara", area: "1,510 km2", rarity: 9 },
        { id: "sanctuary-001", name: "Santuario Galapagos", area: "7,970 km2", rarity: 10 }
    ]
};

class NatureTokenization {
    constructor(blockchain) {
        this.blockchain = blockchain;
    }

    mintAnimal(type, id, wallet) {
        const animals = type === "domestic" ? NATURE_REGISTRY.animals.domestic : NATURE_REGISTRY.animals.wild;
        const animal = animals.find(a => a.id === id);
        if (!animal) throw new Error("Animal not found: " + id);
        return this.blockchain.mintNFT({
            category: "animal", subcategory: type, data: animal,
            mintedAt: new Date().toISOString(), owner: wallet
        });
    }

    mintPlant(id, wallet) {
        const plant = NATURE_REGISTRY.plants.find(p => p.id === id);
        if (!plant) throw new Error("Plant not found: " + id);
        return this.blockchain.mintNFT({
            category: "plant", data: plant,
            mintedAt: new Date().toISOString(), owner: wallet
        });
    }

    mintEcosystem(id, wallet) {
        const eco = NATURE_REGISTRY.ecosystems.find(e => e.id === id);
        if (!eco) throw new Error("Ecosystem not found: " + id);
        return this.blockchain.mintNFT({
            category: "ecosystem", data: eco,
            mintedAt: new Date().toISOString(), owner: wallet
        });
    }

    mintConservation(id, wallet) {
        const area = NATURE_REGISTRY.conservation.find(c => c.id === id);
        if (!area) throw new Error("Area not found: " + id);
        return this.blockchain.mintNFT({
            category: "conservation", data: area,
            mintedAt: new Date().toISOString(), owner: wallet
        });
    }

    getRegistry() { return NATURE_REGISTRY; }
}

module.exports = { NatureTokenization, NATURE_REGISTRY };
