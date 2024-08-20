ARG BUN_VERSION=1.1

# deps stage
FROM oven/bun:${BUN_VERSION} AS deps

RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production && bun pm cache clean

# builder stage
FROM oven/bun:${BUN_VERSION} AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src src
COPY public public
COPY package.json .
COPY tsconfig.json .

ENV NODE_ENV=production

RUN bun run build

# runner stage
FROM oven/bun:${BUN_VERSION} AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 8000

CMD ["bun", "dist/index.js"]
