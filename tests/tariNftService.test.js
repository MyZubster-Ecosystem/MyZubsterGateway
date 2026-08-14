'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { TariNftService, MemoryTariNftRepository, validateSpecies } = require('../services/tariNftService');

const species = {
  scientificName: 'Quercus robur', commonName: 'English oak', taxonomy: 'Fagaceae',
  imageUri: 'ipfs://oak', conservationStatus: 'least_concern', traits: ['native'],
};

test('species metadata requires inspectable identity fields', () => {
  assert.throws(() => validateSpecies({ commonName: 'Oak' }), /scientificName/);
  assert.equal(validateSpecies(species).scientificName, 'Quercus robur');
});

test('mint persists only a wallet-confirmed Tari NFT', async () => {
  const calls = [];
  const repository = new MemoryTariNftRepository();
  const service = new TariNftService({
    repository, now: () => new Date('2026-08-13T00:00:00Z'),
    wallet: { mintNft: async (input) => { calls.push(input); return { transactionId: 'tari_tx_1', network: 'esmeralda' }; } },
  });
  const token = await service.mintSpecies({ owner: 'owner_1', species });
  assert.equal(token.transactionId, 'tari_tx_1');
  assert.equal(token.network, 'esmeralda');
  assert.equal((await repository.tokensByOwner('owner_1')).length, 1);
  assert.equal(calls[0].metadata.commonName, 'English oak');
});

test('mint rejects wallet responses without a transaction reference', async () => {
  const service = new TariNftService({ wallet: { mintNft: async () => ({}) } });
  await assert.rejects(() => service.mintSpecies({ owner: 'owner_1', species }), /transactionId/);
});

test('marketplace purchase transfers ownership after wallet confirmation', async () => {
  const repository = new MemoryTariNftRepository();
  const wallet = {
    mintNft: async () => ({ transactionId: 'mint_tx' }),
    purchaseNft: async (input) => ({ transactionId: `buy_${input.buyer}` }),
  };
  const service = new TariNftService({ wallet, repository });
  const token = await service.mintSpecies({ owner: 'seller', species });
  const listing = await service.createListing({ tokenId: token.tokenId, seller: 'seller', priceMyz: 25 });
  const result = await service.purchase({ listingId: listing.listingId, buyer: 'buyer' });
  assert.equal(result.token.owner, 'buyer');
  assert.equal(result.listing.status, 'sold');
  assert.equal(result.listing.transactionId, 'buy_buyer');
  assert.equal((await repository.activeListings()).length, 0);
});

test('non-owners cannot list a species NFT', async () => {
  const service = new TariNftService({ wallet: { mintNft: async () => ({ transactionId: 'tx' }) } });
  const token = await service.mintSpecies({ owner: 'owner', species });
  await assert.rejects(() => service.createListing({ tokenId: token.tokenId, seller: 'other', priceMyz: 5 }), /Only the owner/);
});
