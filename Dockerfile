# Multi-stage Dockerfile for AletCloud deployment
# Builds the Vite React frontend and serves both API and static assets through Express

FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy all source files and build the production frontend
COPY . .
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built static frontend
COPY --from=builder /app/dist ./dist

# Copy server, database scripts, public assets, and local data
COPY server ./server
COPY database ./database
COPY public ./public
COPY uploads ./uploads
COPY .local-data ./.local-data

# Ensure uploads and local-data directories exist
RUN mkdir -p /app/uploads /app/.local-data

# AletCloud Port Contract: Dynamic PORT environment variable, defaults to 3000
ENV PORT=3000
EXPOSE 3000

# Start Express server (binds to 0.0.0.0:$PORT)
CMD ["node", "server/start.js"]
