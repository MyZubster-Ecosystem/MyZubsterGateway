# Tari species NFTs

The gateway exposes a Tari-backed domain layer for minting plant-species NFTs
and trading them in MYZ. It never manufactures a simulated transaction: mint
and purchase operations are persisted only after the configured wallet RPC
returns a transaction identifier.

## Configuration

- `TARI_WALLET_URL`: Tari wallet JSON-RPC endpoint
- `TARI_WALLET_TOKEN`: optional Bearer token for the wallet endpoint

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/tari/nfts/species` | Mint a species NFT |
| `GET` | `/api/tari/nfts/owners/:owner` | List an owner's NFTs |
| `GET` | `/api/tari/nfts/marketplace` | List active offers |
| `POST` | `/api/tari/nfts/marketplace` | List an owned NFT in MYZ |
| `POST` | `/api/tari/nfts/marketplace/:id/purchase` | Pay and transfer an NFT |

Species metadata requires a scientific name, common name, taxonomy, and an
inspectable image URI. The default repository is in-memory and replaceable so
production deployments can inject MongoDB without coupling storage to wallet RPC.
