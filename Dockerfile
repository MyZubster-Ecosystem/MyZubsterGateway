FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:10000/api/health', r => process.exit(r.statusCode===200?0:1))"
USER node
CMD ["node", "server.js"]
