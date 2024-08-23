FROM oven/bun:1 AS base

# deps stage
FROM base AS deps

# RUN apt-get update && apt-get install -y \
#     && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production && bun pm cache clean

# builder stage
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src src
COPY public public
COPY package.json .
COPY tsconfig.json .

ENV NODE_ENV=production
RUN bun run build

# runner stage
FROM base AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 8000

CMD ["bun", "dist/index.js"]
