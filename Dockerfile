## ─── 1) Base image ───────────────────────────────────────────────────────────
FROM node:18-slim AS base
WORKDIR /home/node/app

## ─── 2) Install dependencies ─────────────────────────────────────────────────
FROM base AS deps
# Make sure the directory exists and is owned by the node user
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
# Copy package files first
COPY --chown=node:node package.json package-lock.json* ./
# Switch to node user before npm operations
USER node
RUN npm ci

## ─── 3) Build the standalone app ─────────────────────────────────────────────
FROM base AS builder
WORKDIR /home/node/app
# Make sure the directory is owned by node
RUN chown -R node:node /home/node/app
# Copy node_modules from deps stage
COPY --from=deps --chown=node:node /home/node/app/node_modules ./node_modules
# Copy source files
COPY --chown=node:node . .
USER node
ENV NEXT_TELEMETRY_DISABLED=1
# We'll use runtime variables instead
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run hf-build

## ─── 4) Runtime image ───────────────────────────────────────────────────────
FROM node:18-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /home/node/app

# Install OS packages needed at runtime
RUN apt-get update \
 && apt-get install -y git wget \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /home/node/app \
 && chown -R node:node /home/node/app

# Copy the standalone build
COPY --from=builder --chown=node:node /home/node/app/.next/standalone ./
COPY --from=builder --chown=node:node /home/node/app/.next/static ./.next/static
COPY --from=builder --chown=node:node /home/node/app/public ./public

# Ensure correct permissions
RUN chmod -R 755 /home/node/app

# Pass runtime environment variables that will be accessed via server API
ENV PORT=3000 \
    NEXT_PUBLIC_HOSTING_SERVICE="huggingface" \
    # These will be available to the server-side API
    USER_PASSWORD="${USER_PASSWORD}" \
    ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
    ADMIN_NAME="${ADMIN_NAME}" \
    ADMIN_EMAIL="${ADMIN_EMAIL}" \
    SENDGRID_API_KEY="${SENDGRID_API_KEY}"

# Switch to node user for running the app
USER node

EXPOSE 3000

CMD ["node", "server.js"]