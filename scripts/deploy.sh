#!/bin/bash
# MyZubster Gateway Deployment Script
set -e

echo "=== MyZubster Gateway Deployment ==="
echo "Started at $(date)"

DEPLOY_DIR="/opt/myzubster-gateway"
BACKUP_DIR="/opt/backups/myzubster-gateway-$(date +%Y%m%d-%H%M%S)"

# Backup current version
echo "Creating backup..."
mkdir -p "$BACKUP_DIR"
if [ -d "$DEPLOY_DIR" ]; then
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/"
fi

# Pull latest
cd "$DEPLOY_DIR"
git fetch origin
git reset --hard origin/main

# Install deps
echo "Installing dependencies..."
npm ci --production

# Restart
echo "Restarting service..."
pm2 restart gateway || pm2 start server.js --name gateway

# Health check
echo "Running health check..."
sleep 5
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$HEALTH" = "200" ]; then
    echo "✅ Deploy successful! Health check: HTTP $HEALTH"
else
    echo "❌ Health check failed: HTTP $HEALTH"
    echo "Rolling back..."
    rm -rf "$DEPLOY_DIR"
    cp -r "$BACKUP_DIR" "$DEPLOY_DIR"
    pm2 restart gateway
    exit 1
fi

echo "=== Deployment complete ==="
