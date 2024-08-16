ARG NODE_VERSION=22-alpine

# deps stage
FROM node:${NODE_VERSION} AS deps

RUN apk add --no-cache && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --production && yarn cache clean

# builder stage
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn run build

# runner stage
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

# standalone
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/public /app/standalone/public
COPY --from=builder /app/.next/static /app/standalone/.next/static

# server
# COPY --from=builder /app/next.config.mjs ./
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "./standalone/server.js"]
