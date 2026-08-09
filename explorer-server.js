#!/usr/bin/env node

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.EXPLORER_PORT || 8081;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: "*", credentials: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    service: "myzubster-explorer",
    version: "1.0.0",
    chainId: 8888,
    timestamp: new Date().toISOString()
  });
});

app.get("/health/", (req, res) => {
  res.json({
    status: "online",
    service: "myzubster-explorer",
    version: "1.0.0",
    chainId: 8888,
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    name: "MyZubster Explorer",
    version: "1.0.0",
    chainId: 8888,
    network: "MyZubster Mainnet",
    contract: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Explorer running on port ${PORT}`);
});
