const axios = require('axios');

/**
 * Tari (MYZ) Blockchain Integration Service
 * Native Tari chain integration for MYZ payments on MyZubster
 */
class TariService {
    constructor(config = {}) {
        this.rpcUrl = config.rpcUrl || process.env.TARI_RPC_URL || 'https://api.myzubster.com/rpc';
        this.chainId = config.chainId || 8888;
        this.contractAddress = config.contractAddress || '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        this.gasPrice = config.gasPrice || '1000000000';
    }

    async getBalance(address) {
        try {
            const response = await axios.post(this.rpcUrl, {
                jsonrpc: '2.0',
                method: 'eth_getBalance',
                params: [address, 'latest'],
                id: 1
            });
            const wei = parseInt(response.data.result || '0x0', 16);
            return {
                address,
                balance_wei: wei.toString(),
                balance_myz: (wei / 1e18).toFixed(6),
                chainId: this.chainId
            };
        } catch (err) {
            return { error: err.message, address };
        }
    }

    async getTransactionCount(address) {
        try {
            const response = await axios.post(this.rpcUrl, {
                jsonrpc: '2.0',
                method: 'eth_getTransactionCount',
                params: [address, 'latest'],
                id: 1
            });
            return { nonce: parseInt(response.data.result || '0x0', 16) };
        } catch (err) {
            return { error: err.message };
        }
    }

    async getTransactionReceipt(txHash) {
        try {
            const response = await axios.post(this.rpcUrl, {
                jsonrpc: '2.0',
                method: 'eth_getTransactionReceipt',
                params: [txHash],
                id: 1
            });
            const receipt = response.data.result;
            return {
                txHash,
                status: receipt ? (parseInt(receipt.status || '0x0', 16) === 1 ? 'success' : 'failed') : 'pending',
                blockNumber: receipt ? parseInt(receipt.blockNumber || '0x0', 16) : null,
                gasUsed: receipt ? parseInt(receipt.gasUsed || '0x0', 16) : null
            };
        } catch (err) {
            return { error: err.message, txHash, status: 'unknown' };
        }
    }

    async getBlockNumber() {
        try {
            const response = await axios.post(this.rpcUrl, {
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1
            });
            return { blockNumber: parseInt(response.data.result || '0x0', 16) };
        } catch (err) {
            return { error: err.message };
        }
    }

    getStatus() {
        return {
            service: 'TariService',
            rpcUrl: this.rpcUrl,
            chainId: this.chainId,
            contractAddress: this.contractAddress,
            status: 'active',
            message: 'Tari blockchain integration active'
        };
    }
}

module.exports = TariService;
