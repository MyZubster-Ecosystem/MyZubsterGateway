#!/usr/bin/env node

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.RPC_PORT || 8545;

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: "*", credentials: true }));
app.use(bodyParser.json({ limit: "10mb" }));

// Health check - sia su /health che su /health/
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    service: "myzubster-rpc",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    chainId: 8888
  });
});

app.get("/health/", (req, res) => {
  res.json({
    status: "online",
    service: "myzubster-rpc",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    chainId: 8888
  });
});

// Root
app.get("/", (req, res) => {
  res.json({
    name: "MyZubster RPC",
    version: "1.0.0",
    chainId: 8888,
    network: "MyZubster Mainnet"
  });
});

app.post("/", (req, res) => {
  const { method, id } = req.body || {};
  res.json({ jsonrpc: "2.0", result: "0x1", id: id || 1 });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ RPC server running on port ${PORT}`);
});
