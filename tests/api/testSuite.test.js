const request = require('supertest');
const express = require('express');

// Mock App for testing
const app = express();
app.use(express.json());
app.use('/api/gateway', require('../../routes/apiGateway'));
app.use('/api/blockchain/smart-contract', require('../../routes/smartContract'));

describe('MyZubsterGateway Test Suite', () => {
    
    // 1. Unit & API Tests
    describe('API Gateway Tests', () => {
        it('should block unauthorized requests', async () => {
            const res = await request(app).get('/api/gateway/cached-data');
            expect(res.statusCode).toEqual(401);
        });

        it('should allow authorized requests', async () => {
            const res = await request(app)
                .get('/api/gateway/cached-data')
                .set('x-api-key', 'test-key-123');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message');
        });
    });

    // 2. Integration Tests
    describe('Smart Contract Integration', () => {
        it('should mint tokens successfully', async () => {
            const res = await request(app)
                .post('/api/blockchain/smart-contract/mint')
                .send({ address: 'test_address', amount: 1000 });
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.tx.amount).toBe(1000);
        });
    });

    // 3. E2E & Performance Tests
    describe('Performance and Rate Limiting', () => {
        it('should limit requests if over threshold', async () => {
            // Send 101 requests rapidly to hit rate limiter
            let res;
            for(let i=0; i<101; i++) {
                res = await request(app)
                    .get('/api/gateway/cached-data')
                    .set('x-api-key', 'test-key-123');
            }
            expect(res.statusCode).toEqual(429); // Too Many Requests
        });
    });
});
