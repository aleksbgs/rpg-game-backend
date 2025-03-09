# Base image with Node 18
FROM node:18-slim AS base
WORKDIR /app

# Install dependencies only when package files change
COPY package.json package-lock.json ./
RUN npm install

# Builder stage for TypeScript compilation
FROM base AS builder
WORKDIR /app
COPY . .
# Install TypeScript and build
RUN npm install typescript --save-dev && npm run build
# Assuming 'build' script outputs to 'dist' folder

# Production stage
FROM node:18-slim AS production
WORKDIR /app
# Install curl as root before switching user
RUN apt-get update && apt-get install -y curl

# Run as non-root user for security
RUN chown node:node /app
USER node

# Copy only necessary files
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN npm ci --only=production

# Expose port (match your app's port, 3002 from your example)
EXPOSE 3003

# Environment variables (optional, can be set via docker run or .env)
ENV NODE_ENV=production


# Start the app (assumes dist/index.js is the entry point)
CMD ["node", "dist/index.js"]