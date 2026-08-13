/**
 * 🔍 Search Service - Ricerca Online Avanzata
 */

const axios = require('axios');

class SearchService {
    constructor() {
        this.searchEngines = {
            duckduckgo: {
                url: 'https://api.duckduckgo.com/',
                enabled: true
            },
            wikipedia: {
                url: 'https://en.wikipedia.org/api/rest_v1/',
                enabled: true
            }
        };
    }

    // Ricerca generica
    async search(query) {
        try {
            console.log('🔍 Ricerca:', query);
            
            const results = {
                query: query,
                sources: [],
                timestamp: new Date().toISOString()
            };

            // Ricerca su DuckDuckGo
            if (this.searchEngines.duckduckgo.enabled) {
                const ddgResult = await this.searchDuckDuckGo(query);
                if (ddgResult) {
                    results.sources.push({
                        source: 'DuckDuckGo',
                        data: ddgResult
                    });
                }
            }

            // Ricerca su Wikipedia
            if (this.searchEngines.wikipedia.enabled) {
                const wikiResult = await this.searchWikipedia(query);
                if (wikiResult) {
                    results.sources.push({
                        source: 'Wikipedia',
                        data: wikiResult
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('❌ Errore ricerca:', error);
            return {
                query: query,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Ricerca su DuckDuckGo
    async searchDuckDuckGo(query) {
        try {
            const response = await axios.get(
                `${this.searchEngines.duckduckgo.url}?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
            );
            
            return {
                abstract: response.data.AbstractText || 'Nessun abstract disponibile',
                url: response.data.AbstractURL || '',
                source: 'DuckDuckGo',
                related: response.data.RelatedTopics?.slice(0, 5) || []
            };
        } catch (error) {
            console.error('❌ Errore DuckDuckGo:', error.message);
            return null;
        }
    }

    // Ricerca su Wikipedia
    async searchWikipedia(query) {
        try {
            const response = await axios.get(
                `${this.searchEngines.wikipedia.url}page/summary/${encodeURIComponent(query)}`
            );
            
            return {
                title: response.data.title || '',
                extract: response.data.extract || '',
                url: response.data.content_urls?.desktop?.page || '',
                source: 'Wikipedia'
            };
        } catch (error) {
            console.error('❌ Errore Wikipedia:', error.message);
            return null;
        }
    }

    // Ricerca botanica specifica
    async searchBotanical(query) {
        try {
            const results = await this.search(query);
            
            // Filtra risultati botanici
            const botanicalKeywords = ['plant', 'flower', 'tree', 'herb', 'medicinal', 'garden'];
            const filtered = results.sources.map(source => {
                const data = source.data;
                const text = JSON.stringify(data).toLowerCase();
                const isBotanical = botanicalKeywords.some(keyword => text.includes(keyword));
                
                return {
                    ...source,
                    isBotanical: isBotanical,
                    relevance: isBotanical ? 'high' : 'medium'
                };
            });
            
            return {
                ...results,
                sources: filtered,
                botanical: filtered.filter(s => s.isBotanical)
            };
        } catch (error) {
            console.error('❌ Errore ricerca botanica:', error);
            return null;
        }
    }

    // Caching delle ricerche
    getCacheKey(query) {
        return `search:${query.toLowerCase().trim()}`;
    }
}

module.exports = { SearchService };
