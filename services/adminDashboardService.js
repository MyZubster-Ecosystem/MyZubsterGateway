'use strict';

const ALLOWED_USER_STATUSES = new Set(['active', 'suspended', 'pending']);
const ALLOWED_USER_ROLES = new Set(['user', 'moderator', 'admin']);
const PAYMENT_COLLECTIONS = ['payments', 'transactions'];

function clamp(value, minimum, maximum, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

function publicUser(user) {
  return {
    id: String(user._id || user.id),
    name: user.name || user.username || '',
    email: user.email || '',
    role: user.role || 'user',
    status: user.status || 'active',
    createdAt: user.createdAt || null,
    lastLoginAt: user.lastLoginAt || null,
  };
}

function serializePayment(payment) {
  return {
    id: String(payment._id || payment.id),
    amount: Number(payment.amount || payment.amountPaid || 0),
    currency: payment.currency || 'XMR',
    status: payment.status || 'unknown',
    txHash: payment.txHash || payment.txid || null,
    createdAt: payment.createdAt || null,
    updatedAt: payment.updatedAt || null,
  };
}

class AdminDashboardService {
  constructor(database, options = {}) {
    this.database = database;
    this.now = options.now || (() => new Date());
  }

  collection(name) {
    if (!this.database || typeof this.database.collection !== 'function') {
      throw new Error('Database is not connected');
    }
    return this.database.collection(name);
  }

  async overview() {
    const users = this.collection('users');
    const orders = this.collection('orders');
    const payments = this.collection('payments');
    const [totalUsers, activeUsers, totalOrders, openOrders, totalPayments, pendingPayments] =
      await Promise.all([
        users.countDocuments(),
        users.countDocuments({ status: 'active' }),
        orders.countDocuments(),
        orders.countDocuments({ status: { $in: ['open', 'pending'] } }),
        payments.countDocuments(),
        payments.countDocuments({ status: { $in: ['pending', 'processing'] } }),
      ]);

    return {
      generatedAt: this.now().toISOString(),
      system: { uptimeSeconds: Math.floor(process.uptime()), node: process.version },
      users: { total: totalUsers, active: activeUsers },
      orders: { total: totalOrders, open: openOrders },
      payments: { total: totalPayments, pending: pendingPayments },
    };
  }

  async users(query = {}) {
    const page = clamp(query.page, 1, 100000, 1);
    const limit = clamp(query.limit, 1, 100, 25);
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.role) filter.role = query.role;
    if (query.search) {
      const escaped = String(query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { username: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    const collection = this.collection('users');
    const [rows, total] = await Promise.all([
      collection.find(filter, {
        projection: { password: 0, passwordHash: 0, refreshToken: 0, twoFactorSecret: 0 },
      }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);

    return { items: rows.map(publicUser), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async updateUser(id, changes = {}) {
    const update = {};
    if (changes.status !== undefined) {
      if (!ALLOWED_USER_STATUSES.has(changes.status)) throw new Error('Unsupported user status');
      update.status = changes.status;
    }
    if (changes.role !== undefined) {
      if (!ALLOWED_USER_ROLES.has(changes.role)) throw new Error('Unsupported user role');
      update.role = changes.role;
    }
    if (!Object.keys(update).length) throw new Error('No supported user changes supplied');
    update.updatedAt = this.now();

    const result = await this.collection('users').findOneAndUpdate(
      { _id: this.database.objectId(id) },
      { $set: update },
      { returnDocument: 'after', projection: { password: 0, passwordHash: 0, refreshToken: 0 } }
    );
    if (!result) throw new Error('User not found');
    return publicUser(result);
  }

  async payments(query = {}) {
    const page = clamp(query.page, 1, 100000, 1);
    const limit = clamp(query.limit, 1, 100, 25);
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.currency) filter.currency = String(query.currency).toUpperCase();
    const collectionName = PAYMENT_COLLECTIONS.includes(query.source) ? query.source : 'payments';
    const collection = this.collection(collectionName);
    const [rows, total] = await Promise.all([
      collection.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);
    return {
      source: collectionName,
      items: rows.map(serializePayment),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async report(days = 30) {
    const windowDays = clamp(days, 1, 365, 30);
    const from = new Date(this.now().getTime() - windowDays * 86400000);
    const pipeline = [
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: { currency: { $ifNull: ['$currency', 'XMR'] }, status: '$status' }, count: { $sum: 1 }, amount: { $sum: { $ifNull: ['$amount', 0] } } } },
      { $sort: { '_id.currency': 1, '_id.status': 1 } },
    ];
    const payments = await this.collection('payments').aggregate(pipeline).toArray();
    return { generatedAt: this.now().toISOString(), from: from.toISOString(), days: windowDays, payments };
  }
}

module.exports = {
  AdminDashboardService,
  ALLOWED_USER_ROLES,
  ALLOWED_USER_STATUSES,
  clamp,
  publicUser,
  serializePayment,
};
