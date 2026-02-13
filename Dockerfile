# ─── Single Stage Build for Railway ───────────────────
FROM node:22-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10

# Copy package files and patches first
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches/

# Install all dependencies (use --no-frozen-lockfile to handle patch hash differences)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build frontend + backend
RUN pnpm build

# Prune dev dependencies after build
RUN pnpm prune --prod

# Expose port (Railway sets PORT env var)
EXPOSE ${PORT:-3000}

# Start the server
CMD ["node", "dist/index.js"]
