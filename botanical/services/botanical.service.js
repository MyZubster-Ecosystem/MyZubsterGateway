/**
 * 🌿 Botanical Service - Gestione Piante Avanzata
 */

class BotanicalService {
    constructor() {
        this.plants = [];
        this.species = [];
        this.loadData();
    }

    // Carica dati iniziali
    loadData() {
        // Piante già registrate
        this.plants = [
            {
                id: 'plant_1',
                name: 'Salvia Officinalis',
                commonName: 'Salvia Antica',
                era: 1500,
                location: 'Orto Botanico di Roma',
                properties: ['medicinale', 'aromatica'],
                status: 'registered',
                registeredAt: new Date().toISOString()
            },
            {
                id: 'plant_2',
                name: 'Rosmarinus Officinalis',
                commonName: 'Rosmarino Romano',
                era: 1500,
                location: 'Orto Botanico di Roma',
                properties: ['medicinale', 'aromatica', 'cucina'],
                status: 'registered',
                registeredAt: new Date().toISOString()
            },
            {
                id: 'plant_3',
                name: 'Lavandula Angustifolia',
                commonName: 'Lavanda Medicinale',
                era: 1500,
                location: 'Orto Botanico di Roma',
                properties: ['medicinale', 'aromatica', 'rilassante'],
                status: 'registered',
                registeredAt: new Date().toISOString()
            }
        ];

        // Specie disponibili
        this.species = [
            { id: 'sp_1', name: 'Salvia Officinalis', family: 'Lamiaceae', type: 'medicinale' },
            { id: 'sp_2', name: 'Rosmarinus Officinalis', family: 'Lamiaceae', type: 'aromatica' },
            { id: 'sp_3', name: 'Lavandula Angustifolia', family: 'Lamiaceae', type: 'rilassante' },
            { id: 'sp_4', name: 'Mentha Piperita', family: 'Lamiaceae', type: 'digestiva' },
            { id: 'sp_5', name: 'Thymus Vulgaris', family: 'Lamiaceae', type: 'antisettica' },
        ];
    }

    // Registra nuova pianta
    async registerPlant(plantData) {
        try {
            const plant = {
                id: `plant_${Date.now()}`,
                ...plantData,
                status: 'registered',
                registeredAt: new Date().toISOString()
            };
            this.plants.push(plant);
            return {
                success: true,
                plant: plant,
                message: `🌿 ${plant.name} registrata con successo!`
            };
        } catch (error) {
            console.error('❌ Errore registrazione:', error);
            return { success: false, error: error.message };
        }
    }

    // Cerca pianta per nome
    async searchPlant(query) {
        try {
            const results = this.plants.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.commonName?.toLowerCase().includes(query.toLowerCase())
            );
            return {
                success: true,
                results: results,
                total: results.length
            };
        } catch (error) {
            console.error('❌ Errore ricerca:', error);
            return { success: false, error: error.message };
        }
    }

    // Ottieni pianta per ID
    async getPlantById(id) {
        try {
            const plant = this.plants.find(p => p.id === id);
            if (!plant) {
                throw new Error('Pianta non trovata');
            }
            return { success: true, plant };
        } catch (error) {
            console.error('❌ Errore:', error);
            return { success: false, error: error.message };
        }
    }

    // Ottieni tutte le piante per epoca
    async getPlantsByEra(era) {
        try {
            const results = this.plants.filter(p => p.era === parseInt(era));
            return {
                success: true,
                results: results,
                total: results.length
            };
        } catch (error) {
            console.error('❌ Errore:', error);
            return { success: false, error: error.message };
        }
    }

    // Ottieni statistiche botaniche
    async getStats() {
        try {
            const eras = {};
            const properties = {};
            
            this.plants.forEach(p => {
                eras[p.era] = (eras[p.era] || 0) + 1;
                p.properties?.forEach(prop => {
                    properties[prop] = (properties[prop] || 0) + 1;
                });
            });

            return {
                success: true,
                stats: {
                    total: this.plants.length,
                    byEra: eras,
                    byProperty: properties,
                    lastAdded: this.plants[this.plants.length - 1] || null
                }
            };
        } catch (error) {
            console.error('❌ Errore:', error);
            return { success: false, error: error.message };
        }
    }

    // Ottieni specie disponibili
    async getSpecies() {
        return {
            success: true,
            species: this.species,
            total: this.species.length
        };
    }
}

module.exports = { BotanicalService };
