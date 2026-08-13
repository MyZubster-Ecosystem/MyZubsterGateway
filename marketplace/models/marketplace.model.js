/**
 * 🛒 Marketplace Model - Modello Marketplace
 */

class Product {
    constructor(data) {
        this.id = data.id || `product_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        this.name = data.name;
        this.description = data.description;
        this.category = data.category || 'seeds'; // seeds, plants, tools, nft
        this.price = data.price || 0;
        this.currency = data.currency || 'MYZ';
        this.quantity = data.quantity || 1;
        this.sellerId = data.sellerId;
        this.images = data.images || [];
        this.tags = data.tags || [];
        this.species = data.species || null;
        this.era = data.era || null;
        this.isAuction = data.isAuction || false;
        this.auctionEnd = data.auctionEnd || null;
        this.minBid = data.minBid || null;
        this.status = data.status || 'active'; // active, sold, auction, cancelled
        this.rating = data.rating || 0;
        this.reviews = data.reviews || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // Aggiungi recensione
    addReview(userId, rating, comment) {
        this.reviews.push({
            userId,
            rating,
            comment,
            timestamp: new Date().toISOString()
        });
        this.rating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
        this.updatedAt = new Date().toISOString();
    }

    // Aggiorna quantità
    updateQuantity(quantity) {
        this.quantity = quantity;
        this.updatedAt = new Date().toISOString();
    }

    // Marca come venduto
    markAsSold() {
        this.status = 'sold';
        this.updatedAt = new Date().toISOString();
    }

    // Avvia asta
    startAuction(endDate, minBid) {
        this.isAuction = true;
        this.auctionEnd = endDate;
        this.minBid = minBid || this.price;
        this.status = 'auction';
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            category: this.category,
            price: this.price,
            currency: this.currency,
            quantity: this.quantity,
            sellerId: this.sellerId,
            images: this.images,
            tags: this.tags,
            species: this.species,
            era: this.era,
            isAuction: this.isAuction,
            auctionEnd: this.auctionEnd,
            minBid: this.minBid,
            status: this.status,
            rating: this.rating,
            reviews: this.reviews,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

class Order {
    constructor(data) {
        this.id = data.id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        this.buyerId = data.buyerId;
        this.products = data.products || [];
        this.total = data.total || 0;
        this.currency = data.currency || 'MYZ';
        this.status = data.status || 'pending'; // pending, paid, shipped, delivered, cancelled
        this.shippingAddress = data.shippingAddress || null;
        this.paymentId = data.paymentId || null;
        this.trackingNumber = data.trackingNumber || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.deliveredAt = data.deliveredAt || null;
    }

    // Aggiorna stato
    updateStatus(status) {
        this.status = status;
        this.updatedAt = new Date().toISOString();
        if (status === 'delivered') {
            this.deliveredAt = new Date().toISOString();
        }
    }

    // Aggiungi tracking
    addTracking(trackingNumber) {
        this.trackingNumber = trackingNumber;
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            buyerId: this.buyerId,
            products: this.products,
            total: this.total,
            currency: this.currency,
            status: this.status,
            shippingAddress: this.shippingAddress,
            paymentId: this.paymentId,
            trackingNumber: this.trackingNumber,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            deliveredAt: this.deliveredAt
        };
    }
}

module.exports = { Product, Order };
