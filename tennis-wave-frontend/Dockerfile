# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy only the necessary files
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the built application and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/node_modules ./node_modules

# Use PORT environment variable for Railway
EXPOSE ${PORT:-3000}

CMD ["npm", "start"]