# ─── Stage: Production ────────────────────────────────────
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY server/package.json server/package-lock.json ./server/

# Install production dependencies
WORKDIR /app/server
RUN npm ci --omit=dev

# Copy server source code
WORKDIR /app
COPY server/ ./server/

# Copy client static files
COPY client/ ./client/

# Expose the port
EXPOSE 5000

# Set environment variable defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start the server
WORKDIR /app/server
CMD ["node", "server.js"]
