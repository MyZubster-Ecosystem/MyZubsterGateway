/**
 * 🎯 Bounty Model - Modello Bounty
 */

class Bounty {
    constructor(data) {
        this.id = data.id || `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        this.title = data.title;
        this.description = data.description;
        this.category = data.category || 'development';
        this.priority = data.priority || 'medium';
        this.bountyAmount = data.bountyAmount || 0;
        this.currency = data.currency || 'MYZ';
        this.status = data.status || 'open'; // open, assigned, in_progress, review, completed, cancelled
        this.createdBy = data.createdBy;
        this.assignedTo = data.assignedTo || null;
        this.tags = data.tags || [];
        this.difficulty = data.difficulty || 'medium';
        this.estimatedHours = data.estimatedHours || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.completedAt = data.completedAt || null;
        this.reviewers = data.reviewers || [];
        this.comments = data.comments || [];
        this.attachments = data.attachments || [];

        // Payment / escrow lifecycle (Issue #1335)
        this.paymentRequested = data.paymentRequested || false;
        this.paymentStatus = data.paymentStatus || 'not_requested';
        // allowed values: not_requested | pending | confirmed | failed
        this.transactionId = data.transactionId || null;
        this.retryCount = data.retryCount || 0;
        this.reconciledAt = data.reconciledAt || null;
        this.paymentRequestedAt = data.paymentRequestedAt || null;
    }

    // Assegna bounty a un contributor
    assignTo(userId) {
        if (this.status !== 'open') {
            throw new Error('Il bounty non è disponibile per l\'assegnazione');
        }
        this.assignedTo = userId;
        this.status = 'assigned';
        this.updatedAt = new Date().toISOString();
    }

    // Avvia il lavoro sul bounty
    startWork() {
        if (this.status !== 'assigned') {
            throw new Error('Il bounty deve essere assegnato prima di iniziare');
        }
        this.status = 'in_progress';
        this.updatedAt = new Date().toISOString();
    }

    // Completa il bounty
    complete() {
        if (this.status !== 'in_progress') {
            throw new Error('Il bounty non è in lavorazione');
        }
        this.status = 'review';
        this.updatedAt = new Date().toISOString();
    }

    // Approva il bounty
    approve(reviewerId) {
        if (this.status !== 'review') {
            throw new Error('Il bounty non è in revisione');
        }
        this.reviewers.push(reviewerId);
        this.status = 'completed';
        this.completedAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    // Rifiuta il bounty (rimanda in lavorazione)
    reject(reviewerId, reason) {
        if (this.status !== 'review') {
            throw new Error('Il bounty non è in revisione');
        }
        this.reviewers.push(reviewerId);
        this.status = 'in_progress';
        this.updatedAt = new Date().toISOString();
        this.comments.push({
            user: reviewerId,
            text: `Rifiutato: ${reason}`,
            timestamp: new Date().toISOString()
        });
    }

    // Aggiungi commento
    addComment(userId, text) {
        this.comments.push({
            user: userId,
            text: text,
            timestamp: new Date().toISOString()
        });
        this.updatedAt = new Date().toISOString();
    }

   // Richiede il pagamento escrow per un bounty completato
requestPayment() {
    if (this.status !== 'completed') {
        throw new Error('Payment can only be requested for completed bounties');
    }

    if (this.paymentRequested) {
        throw new Error('Payment already requested');
    }

    this.paymentRequested = true;
    this.paymentStatus = 'pending';
    this.paymentRequestedAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
}

    // Collega la transazione escrow al bounty
    attachTransaction(transactionId) {
        if (!this.paymentRequested) {
            throw new Error('Payment was never requested for this bounty');
        }
        this.transactionId = transactionId;
        this.updatedAt = new Date().toISOString();
    }

   // Conferma il pagamento escrow
confirmPayment() {
    if (!this.transactionId) {
        throw new Error('No transaction attached to this bounty');
    }

    // Idempotent: confirming an already confirmed payment is a no-op.
    if (this.paymentStatus === 'confirmed') {
        return;
    }

    if (this.paymentStatus !== 'pending') {
        throw new Error(
            `Cannot confirm payment from status "${this.paymentStatus}"`
        );
    }

    this.paymentStatus = 'confirmed';
    this.reconciledAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
}

    // Segna il pagamento come fallito e incrementa i tentativi
    failPayment() {
        this.paymentStatus = 'failed';
        this.retryCount += 1;
        this.updatedAt = new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            category: this.category,
            priority: this.priority,
            bountyAmount: this.bountyAmount,
            currency: this.currency,
            status: this.status,
            createdBy: this.createdBy,
            assignedTo: this.assignedTo,
            tags: this.tags,
            difficulty: this.difficulty,
            estimatedHours: this.estimatedHours,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            completedAt: this.completedAt,
            reviewers: this.reviewers,
            comments: this.comments,
            attachments: this.attachments,
            paymentRequested: this.paymentRequested,
            paymentStatus: this.paymentStatus,
            transactionId: this.transactionId,
            retryCount: this.retryCount,
            reconciledAt: this.reconciledAt,
            paymentRequestedAt: this.paymentRequestedAt
        };
    }
}

module.exports = { Bounty };