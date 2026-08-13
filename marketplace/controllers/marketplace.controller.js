/**
 * 🛒 Marketplace Controller - Gestione Marketplace
 */

const fs = require('fs');
const path = require('path');
const { Product, Order } = require('../models/marketplace.model');

const PRODUCTS_FILE = path.join(__dirname, '../../../products.json');
const ORDERS_FILE = path.join(__dirname, '../../../orders.json');

class MarketplaceController {
    constructor() {
        this.products = [];
        this.orders = [];
        this.loadProducts();
        this.loadOrders();
    }

    // Carica i prodotti
    loadProducts() {
        try {
            if (fs.existsSync(PRODUCTS_FILE)) {
                const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
                const productsData = JSON.parse(data);
                this.products = productsData.map(p => new Product(p));
            }
        } catch (error) {
            console.error('❌ Errore caricamento prodotti:', error);
            this.products = [];
        }
    }

    // Salva i prodotti
    saveProducts() {
        try {
            fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(this.products.map(p => p.toJSON()), null, 2));
        } catch (error) {
            console.error('❌ Errore salvataggio prodotti:', error);
        }
    }

    // Carica gli ordini
    loadOrders() {
        try {
            if (fs.existsSync(ORDERS_FILE)) {
                const data = fs.readFileSync(ORDERS_FILE, 'utf8');
                const ordersData = JSON.parse(data);
                this.orders = ordersData.map(o => new Order(o));
            }
        } catch (error) {
            console.error('❌ Errore caricamento ordini:', error);
            this.orders = [];
        }
    }

    // Salva gli ordini
    saveOrders() {
        try {
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(this.orders.map(o => o.toJSON()), null, 2));
        } catch (error) {
            console.error('❌ Errore salvataggio ordini:', error);
        }
    }

    // Crea prodotto
    async createProduct(req, res) {
        try {
            const { name, description, category, price, currency, quantity, images, tags, species, era, isAuction, auctionEnd, minBid } = req.body;
            
            const product = new Product({
                name,
                description,
                category,
                price,
                currency: currency || 'MYZ',
                quantity: quantity || 1,
                sellerId: req.user.id,
                images: images || [],
                tags: tags || [],
                species,
                era,
                isAuction: isAuction || false,
                auctionEnd,
                minBid
            });
            
            this.products.push(product);
            this.saveProducts();
            
            res.status(201).json({
                success: true,
                data: product.toJSON(),
                message: 'Prodotto creato con successo'
            });
        } catch (error) {
            console.error('❌ Errore creazione prodotto:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Ottieni tutti i prodotti
    async getProducts(req, res) {
        try {
            const { category, species, era, minPrice, maxPrice, status, search } = req.query;
            
            let filtered = this.products.filter(p => p.status === 'active' || p.status === 'auction');
            
            if (category) {
                filtered = filtered.filter(p => p.category === category);
            }
            if (species) {
                filtered = filtered.filter(p => p.species && p.species.includes(species));
            }
            if (era) {
                filtered = filtered.filter(p => p.era == era);
            }
            if (minPrice) {
                filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
            }
            if (maxPrice) {
                filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
            }
            if (status) {
                filtered = filtered.filter(p => p.status === status);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower) ||
                    p.tags.some(t => t.toLowerCase().includes(searchLower))
                );
            }
            
            res.json({
                success: true,
                data: filtered.map(p => p.toJSON()),
                total: filtered.length
            });
        } catch (error) {
            console.error('❌ Errore recupero prodotti:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Ottieni prodotto specifico
    async getProduct(req, res) {
        try {
            const { id } = req.params;
            const product = this.products.find(p => p.id === id);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Prodotto non trovato'
                });
            }
            
            res.json({
                success: true,
                data: product.toJSON()
            });
        } catch (error) {
            console.error('❌ Errore recupero prodotto:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Crea ordine
    async createOrder(req, res) {
        try {
            const { products, shippingAddress } = req.body;
            
            // Verifica disponibilità
            let total = 0;
            const orderProducts = [];
            
            for (const item of products) {
                const product = this.products.find(p => p.id === item.productId);
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        error: `Prodotto ${item.productId} non trovato`
                    });
                }
                if (product.quantity < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        error: `Quantità insufficiente per ${product.name}`
                    });
                }
                
                total += product.price * item.quantity;
                orderProducts.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    sellerId: product.sellerId
                });
                
                // Aggiorna quantità
                product.updateQuantity(product.quantity - item.quantity);
            }
            
            const order = new Order({
                buyerId: req.user.id,
                products: orderProducts,
                total,
                currency: 'MYZ',
                shippingAddress,
                status: 'pending'
            });
            
            this.orders.push(order);
            this.saveProducts();
            this.saveOrders();
            
            res.status(201).json({
                success: true,
                data: order.toJSON(),
                message: 'Ordine creato con successo'
            });
        } catch (error) {
            console.error('❌ Errore creazione ordine:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Ottieni ordini utente
    async getOrders(req, res) {
        try {
            const userOrders = this.orders.filter(o => o.buyerId === req.user.id);
            
            res.json({
                success: true,
                data: userOrders.map(o => o.toJSON()),
                total: userOrders.length
            });
        } catch (error) {
            console.error('❌ Errore recupero ordini:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Aggiorna ordine
    async updateOrder(req, res) {
        try {
            const { id } = req.params;
            const { status, trackingNumber } = req.body;
            
            const order = this.orders.find(o => o.id === id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Ordine non trovato'
                });
            }
            
            if (status) {
                order.updateStatus(status);
            }
            if (trackingNumber) {
                order.addTracking(trackingNumber);
            }
            
            this.saveOrders();
            
            res.json({
                success: true,
                data: order.toJSON(),
                message: 'Ordine aggiornato con successo'
            });
        } catch (error) {
            console.error('❌ Errore aggiornamento ordine:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Aggiungi recensione
    async addReview(req, res) {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;
            
            const product = this.products.find(p => p.id === id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Prodotto non trovato'
                });
            }
            
            product.addReview(req.user.id, rating, comment);
            this.saveProducts();
            
            res.json({
                success: true,
                data: product.toJSON(),
                message: 'Recensione aggiunta con successo'
            });
        } catch (error) {
            console.error('❌ Errore aggiunta recensione:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Statistiche marketplace
    async getMarketplaceStats(req, res) {
        try {
            const totalProducts = this.products.length;
            const activeProducts = this.products.filter(p => p.status === 'active').length;
            const auctionProducts = this.products.filter(p => p.status === 'auction').length;
            const totalOrders = this.orders.length;
            const completedOrders = this.orders.filter(o => o.status === 'delivered').length;
            
            const totalRevenue = this.orders
                .filter(o => o.status === 'delivered' || o.status === 'paid')
                .reduce((sum, o) => sum + o.total, 0);
            
            res.json({
                success: true,
                data: {
                    totalProducts,
                    activeProducts,
                    auctionProducts,
                    totalOrders,
                    completedOrders,
                    totalRevenue,
                    completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(1) : 0
                }
            });
        } catch (error) {
            console.error('❌ Errore statistiche marketplace:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = { MarketplaceController };
