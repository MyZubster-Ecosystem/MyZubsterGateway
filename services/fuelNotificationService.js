// services/fuelNotificationService.js — Notifiche rifornimento XMR
const EventEmitter = require('events');

class FuelNotificationService extends EventEmitter {
  constructor() {
    super();
    this.receipts = new Map();
    this.notificationChannels = ['telegram', 'email']; // can be expanded
    console.log('[FUEL-NOTIFY] Service initialized');
  }

  // Generate digital receipt after payment confirmed
  generateReceipt(paymentData) {
    const receiptId = `RCT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const receipt = {
      id: receiptId,
      transactionId: paymentData.txId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'XMR',
      fuelType: paymentData.fuelType || 'benzina',
      liters: paymentData.liters || 0,
      pricePerLiter: paymentData.pricePerLiter || 0,
      stationName: paymentData.stationName || 'MyZubster Station',
      stationAddress: paymentData.stationAddress || '',
      paymentConfirmed: paymentData.confirmed || true,
      blockchainConfirmations: paymentData.confirmations || 0,
      issuedAt: new Date().toISOString(),
      status: 'issued'
    };
    this.receipts.set(receiptId, receipt);
    
    // Emit notification event
    this.emit('payment-confirmed', receipt);
    
    return receipt;
  }

  // Send notification on payment confirmation
  async notifyPaymentConfirmed(receipt) {
    const notifications = [];
    
    // Telegram notification (if configured)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const message = this._formatTelegramMessage(receipt);
      try {
        const axios = require('axios');
        await axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          { chat_id: process.env.TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' }
        );
        notifications.push({ channel: 'telegram', status: 'sent' });
      } catch (e) {
        notifications.push({ channel: 'telegram', status: 'failed', error: e.message });
      }
    }

    // Email notification placeholder
    notifications.push({ channel: 'email', status: 'queued' });
    
    return { receipt: receipt.id, notifications };
  }

  // Format message for Telegram
  _formatTelegramMessage(receipt) {
    return [
      `🔵 *Rifornimento Confermato*`,
      ``,
      `📍 *Stazione*: ${receipt.stationName}`,
      `⛽ *Carburante*: ${receipt.fuelType} — ${receipt.liters}L`,
      `💰 *Importo*: ${receipt.amount} ${receipt.currency}`,
      `💶 *Prezzo/L*: €${receipt.pricePerLiter}`,
      `🔗 *Ricevuta*: ${receipt.id}`,
      ``,
      `*Conferme Blockchain*: ${receipt.blockchainConfirmations}`,
      `*Data*: ${new Date(receipt.issuedAt).toLocaleString('it-IT')}`
    ].join('\n');
  }

  // Get receipt by ID
  getReceipt(receiptId) {
    return this.receipts.get(receiptId) || null;
  }

  // Get all receipts (with optional filters)
  getReceipts(filter = {}) {
    let list = Array.from(this.receipts.values());
    
    if (filter.status) {
      list = list.filter(r => r.status === filter.status);
    }
    if (filter.currency) {
      list = list.filter(r => r.currency === filter.currency);
    }
    
    return list.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
      .slice(0, filter.limit || 50);
  }

  // Export receipts as CSV
  exportReceiptsCSV(filter = {}) {
    const receipts = this.getReceipts(filter);
    const header = 'ID,Data,Stazione,Carburante,Litri,Importo,Valuta,Conferme';
    const rows = receipts.map(r => 
      `${r.id},${r.issuedAt},${r.stationName},${r.fuelType},${r.liters},${r.amount},${r.currency},${r.blockchainConfirmations}`
    );
    return [header, ...rows].join('\n');
  }
}

module.exports = new FuelNotificationService();
