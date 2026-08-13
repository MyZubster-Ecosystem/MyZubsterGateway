'use strict';

const crypto = require('crypto');

const SPECIES_REQUIRED_FIELDS = ['scientificName', 'commonName', 'taxonomy', 'imageUri'];

function normalizeAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('priceMyz must be positive');
  return amount;
}

function validateSpecies(species = {}) {
  for (const field of SPECIES_REQUIRED_FIELDS) {
    if (!species[field] || typeof species[field] !== 'string') {
      throw new Error(`species.${field} is required`);
    }
  }
  return {
    scientificName: species.scientificName.trim(),
    commonName: species.commonName.trim(),
    taxonomy: species.taxonomy.trim(),
    imageUri: species.imageUri.trim(),
    conservationStatus: species.conservationStatus || 'not_evaluated',
    traits: Array.isArray(species.traits) ? species.traits : [],
  };
}

class MemoryTariNftRepository {
  constructor() {
    this.tokens = new Map();
    this.listings = new Map();
  }
  async saveToken(token) { this.tokens.set(token.tokenId, structuredClone(token)); return token; }
  async token(tokenId) { return this.tokens.get(tokenId) || null; }
  async tokensByOwner(owner) { return [...this.tokens.values()].filter((token) => token.owner === owner); }
  async saveListing(listing) { this.listings.set(listing.listingId, structuredClone(listing)); return listing; }
  async listing(listingId) { return this.listings.get(listingId) || null; }
  async activeListings() { return [...this.listings.values()].filter((listing) => listing.status === 'active'); }
}

class TariNftService {
  constructor({ wallet, repository = new MemoryTariNftRepository(), now = () => new Date() }) {
    if (!wallet) throw new Error('Tari wallet adapter is required');
    this.wallet = wallet;
    this.repository = repository;
    this.now = now;
  }

  id(prefix) { return `${prefix}_${crypto.randomUUID()}`; }

  async mintSpecies({ owner, species }) {
    if (!owner) throw new Error('owner is required');
    const metadata = validateSpecies(species);
    const tokenId = this.id('species');
    const walletResult = await this.wallet.mintNft({ tokenId, owner, metadata });
    if (!walletResult || !walletResult.transactionId) {
      throw new Error('Tari wallet did not return a transactionId');
    }
    return this.repository.saveToken({
      tokenId, owner, metadata, network: walletResult.network || 'tari',
      transactionId: walletResult.transactionId, mintedAt: this.now().toISOString(),
    });
  }

  async createListing({ tokenId, seller, priceMyz }) {
    const token = await this.repository.token(tokenId);
    if (!token) throw new Error('NFT not found');
    if (token.owner !== seller) throw new Error('Only the owner can list this NFT');
    const existing = (await this.repository.activeListings()).find((item) => item.tokenId === tokenId);
    if (existing) throw new Error('NFT is already listed');
    return this.repository.saveListing({
      listingId: this.id('listing'), tokenId, seller, priceMyz: normalizeAmount(priceMyz),
      status: 'active', createdAt: this.now().toISOString(),
    });
  }

  async purchase({ listingId, buyer }) {
    if (!buyer) throw new Error('buyer is required');
    const listing = await this.repository.listing(listingId);
    if (!listing || listing.status !== 'active') throw new Error('Active listing not found');
    if (buyer === listing.seller) throw new Error('Seller cannot buy their own NFT');
    const token = await this.repository.token(listing.tokenId);
    const result = await this.wallet.purchaseNft({
      tokenId: token.tokenId, buyer, seller: listing.seller, amountMyz: listing.priceMyz,
    });
    if (!result || !result.transactionId) throw new Error('Tari wallet did not confirm purchase');
    token.owner = buyer;
    token.lastTransactionId = result.transactionId;
    listing.status = 'sold';
    listing.buyer = buyer;
    listing.transactionId = result.transactionId;
    listing.soldAt = this.now().toISOString();
    await this.repository.saveToken(token);
    await this.repository.saveListing(listing);
    return { token, listing };
  }
}

module.exports = { TariNftService, MemoryTariNftRepository, normalizeAmount, validateSpecies };
