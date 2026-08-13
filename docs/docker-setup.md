# MyZubster Docker Setup

## Quick Start
```bash
cp .env.example .env
# Edit .env with your settings
docker-compose up -d
```

## Services
| Service | Port | Description |
|---------|------|-------------|
| Gateway | 10000 | Main Node.js API |
| MongoDB | 27017 | Database |
| Tari Wallet Stub | 12021 | MYZ wallet stub |
| Monero Wallet Stub | 18082 | XMR wallet stub |

## Commands
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f gateway # Follow gateway logs
docker-compose ps             # List running services
```

## Health Checks
All services have health checks. Gateway waits for MongoDB + wallet stubs before starting.
