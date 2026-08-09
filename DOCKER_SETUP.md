# MyZubster Gateway - Docker Setup Summary

## What Was Created

### 1. **Dockerfile** (Multi-Stage Build)
- **Builder Stage**: Installs production dependencies only, reducing final image size
- **Runtime Stage**: Lightweight Alpine Linux with Node.js 18
- **Security**: Non-root user (nodejs:1001), dumb-init for signal handling
- **Health Check**: HTTP endpoint at `/health` with 30s intervals
- **Entry Point**: Graceful signal handling with dumb-init

**Image Size**: ~53MB (efficient Alpine-based)

### 2. **.dockerignore**
Excludes unnecessary files to reduce build context:
- node_modules, logs, backup files
- Git data, tests, coverage reports
- IDE/editor configs (.vscode, .idea)

### 3. **docker-compose.yml** (Production-Ready)
**Services**:
- **MongoDB**: v7 with health checks, volume persistence, networking
- **Gateway**: Express API service with:
  - Automatic health checks
  - Environment variable injection
  - Service dependencies (waits for MongoDB)
  - Network isolation via custom bridge network
  - Port mapping (default: 10000)

**Features**:
- Health checks on both services
- Network bridge for inter-service communication
- Persistent MongoDB volume
- Environment file support (.env, .env.docker)
- Graceful restarts (unless-stopped policy)

### 4. **.env.docker**
Template for Docker environment variables (non-production defaults)

### 5. **package.json**
Created from project dependencies with:
- Production dependencies only
- Node.js >=18.0.0 requirement
- Start and dev scripts

## Quick Start

### Build the Image (Already Done)
```bash
cd MyZubsterGateway
docker build -t myzubster-gateway:latest .
```

### Run with Docker Compose
```bash
# Start services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f gateway

# Stop services
docker compose down
```

### Run Standalone Container
```bash
docker run -d \
  --name myzubster-gateway \
  -p 10000:10000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://user:pass@mongodb:27017/myzubster \
  -e JWT_SECRET=your-secret-key \
  myzubster-gateway:latest
```

## Best Practices Implemented

✅ **Multi-Stage Builds**: Separated builder and runtime for minimal image size
✅ **Non-Root User**: Runs as nodejs user (UID 1001) for security
✅ **Health Checks**: HTTP endpoint monitoring on both services
✅ **Signal Handling**: dumb-init ensures graceful shutdowns
✅ **Environment Variables**: Externalized config via .env files
✅ **Volume Persistence**: MongoDB data survives container restarts
✅ **Networking**: Custom bridge network isolates services
✅ **Layer Caching**: Optimized Dockerfile order for build speed
✅ **Alpine Linux**: Lightweight base image (~5MB)

## Ports
- **Gateway**: 10000 (configurable via `GATEWAY_PORT` env var)
- **MongoDB**: 27017 (only exposed if needed; remove from compose for production)

## Security Notes
- Change `MONGO_PASSWORD` in .env.docker before production deployment
- Change `JWT_SECRET` to a strong, random value
- Remove MongoDB port exposure in production (internal-only via network)
- Use Docker secrets for sensitive data in swarm/Kubernetes environments
- Consider using private image registry for production

## Health Endpoint
```bash
curl http://localhost:10000/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-08-09T...",
  "security": { "rateLimit": "active", ... }
}
```

## Troubleshooting

### Services won't start
```bash
docker compose logs mongodb
docker compose logs gateway
```

### MongoDB connection errors
Verify MongoDB is healthy:
```bash
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Port already in use
Change port mapping in docker-compose.yml:
```yaml
ports:
  - "8080:10000"  # Host:Container
```

## Next Steps
1. Update environment variables in `.env.docker`
2. Test locally: `docker compose up`
3. Push to Docker registry: `docker push <registry>/myzubster-gateway:latest`
4. Deploy to Docker Swarm, Kubernetes, or Docker's Container Cloud
5. Set up CI/CD pipeline for automated builds
