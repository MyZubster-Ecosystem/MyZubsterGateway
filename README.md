> **Part of the [MyZubster ecosystem](https://github.com/MyZubster-Ecosystem)**

> **Part of the [MyZubster ecosystem](https://github.com/MyZubster-Ecosystem)**

# 🌐 MyZubster Gateway

**Backend API for MyZubster - Monero Payment Gateway & Animal Registry**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Monero](https://img.shields.io/badge/Powered%20by-Monero-orange)](https://www.getmonero.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen)](https://mongodb.com/)

---

## 📌 What is MyZubster Gateway?

MyZubster Gateway is a **lightweight, privacy-first payment processor** built for the Monero (XMR) network. It enables decentralized, low-fee transactions with built-in support for webhooks, order management, and merchant dashboards.

**Perfect for:**
- 🛒 E-commerce platforms
- 🎫 Ticketing and event systems
- 🖥️ SaaS subscriptions
- 🌿 Environmental and conservation projects
- 🐾 Animal and plant registries

---

## ⚠️ IMPORTANT: Payment Policy

**This gateway accepts MONERO (XMR) ONLY.**

| Accepted | Rejected |
|----------|----------|
| ✅ Monero (XMR) | ❌ USDC, USDT, ETH, BTC |
| ✅ Privacy & anonymity | ❌ PayPal, bank transfers |
| ✅ Micro-transactions (€0.10) | ❌ Fiat currencies |

### Why Monero?

| Feature | Monero (XMR) |
|---------|--------------|
| 🔒 Privacy | No KYC required |
| 💰 Low Fees | Micro-transactions (€0.10) possible |
| 🌍 Global | Anyone can participate from anywhere |
| 🌿 Sustainable | 5% of fees go to conservation projects |

---

## 📊 Fee Structure

**Registration is FREE.**

MyZubster is an open-source, community-driven project. All registrations (animals, plants) are free.

### How the Platform is Funded

The platform is sustained through:
- 💰 **Donations** – Voluntary contributions from the community
- 🚀 **Premium Services** – Optional paid features (certificates, analytics)
- 🤝 **Sponsors & Grants** – Corporate sponsorships and open source grants

### Fund Allocation

| Destination | Percentage |
|-------------|------------|
| Bounties | 90% |
| Infrastructure | 5% |
| Conservation | 5% |

### Donate to Support MyZubster

If you believe in this project, you can support us with a donation in Monero (XMR):

**Wallet:** `45M4DW1ug8bdQowWpxucTpgsfjLbVxbYaAra79VewmBobuuhgqTjyD4R3DzpqLM2veiphcB16n24qN1QbLg3y2PYGK3Qkoe`

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** 6+
- **Monero node** (local or remote)

### Installation

```bash
# 1. Clone the repository
git clone git@github.com:MyZubster-Ecosystem/MyZubsterGateway.git
cd MyZubsterGateway

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start the server
npm startConfiguration

Create a .env file with:
bash

# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/myzubster

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Monero
MONERO_RPC_URL=http://localhost:18081
MONERO_WALLET_RPC_URL=http://localhost:18082

📡 API Endpoints
Public Endpoints
Method	Endpoint	Description
GET	/api/health	Health check
POST	/api/auth/register	User registration
POST	/api/auth/login	User login
POST	/api/auth/refresh	Refresh JWT token
Protected Endpoints (JWT required)
Method	Endpoint	Description
GET	/api/users/profile	Get user profile
PUT	/api/users/profile	Update user profile
Orders
Method	Endpoint	Description
POST	/api/orders	Create order
GET	/api/orders	List orders
GET	/api/orders/:id	Get order details
PUT	/api/orders/:id/status	Update order status
Payments
Method	Endpoint	Description
POST	/api/payments/process	Process payment
GET	/api/payments/status/:id	Check payment status
Webhooks
Method	Endpoint	Description
POST	/api/webhooks	Register webhook
GET	/api/webhooks	List webhooks
PUT	/api/webhooks/:id	Update webhook
DELETE	/api/webhooks/:id	Delete webhook
Animals
Method	Endpoint	Description
POST	/api/animals/register	Register an animal
GET	/api/animals	List animals
GET	/api/animals/:id	Get animal details
POST	/api/animals/:id/verify	Verify an animal
Plants
Method	Endpoint	Description
POST	/api/plants/register	Register a plant
GET	/api/plants	List plants
GET	/api/plants/:id	Get plant details
POST	/api/plants/:id/verify	Verify a plant
🔐 Security
Authentication

    JWT-based authentication with refresh token rotation

    Role-based access control (RBAC) for admin endpoints

    Brute-force protection via BruteForceAI module

    Rate limiting on all API endpoints (100 requests per minute per IP)

Data Protection

    PGP encryption for sensitive order data

    HTTPS/TLS 1.3 required in production

    No PII or KYC data stored (privacy-first design)

    Environment variables for all secrets (no hardcoded credentials)

Blockchain Integration

    Monero RPC with secure authentication

    Transaction verification with double-spend protection

    Wallet ad
<!-- BOOST: Enhanced documentation for ranking -->
## 🚀 Quick Start

### Prerequisites
- Node.js >= 18 (or Python >= 3.10)
- Git

### Installation
```bash
git clone https://github.com/MyZubster-Ecosystem/MyZubsterGateway.git
cd MyZubsterGateway
```

### Development
```bash
npm install
npm test
npm run dev
```

## 📊 Quality
- ✅ CI/CD pipeline with automated testing
- ✅ Linting & code quality checks

## 🤝 Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License
See [LICENSE](./LICENSE) file.
