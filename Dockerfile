# ============================================================================
# Grünerator Docs Frontend - Production Dockerfile
# ============================================================================
# Multi-stage build for optimized production image
# Stage 1: Build the Vite app
# Stage 2: Serve static files with nginx
# ============================================================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL=https://gruenerator.eu/api
ARG VITE_HOCUSPOCUS_URL=wss://gruenerator.eu:1240

# Set as environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_HOCUSPOCUS_URL=$VITE_HOCUSPOCUS_URL

# Build for production
RUN npm run build

# ============================================================================
# Production stage - Nginx
# ============================================================================
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
