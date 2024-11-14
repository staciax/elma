FROM oven/bun:1 AS base

# deps stage
FROM base AS deps

WORKDIR /app
COPY package.json .
# COPY bun.lockb .
RUN bun install --frozen-lockfile --production

# builder stage
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src src
COPY package.json .
COPY tsconfig.json .

ENV NODE_ENV=production
RUN bun build \
    --compile \
    --minify \
    --target bun \
    --outfile server \
    ./src/index.ts

# https://elysiajs.com/patterns/deployment.html#why-not-minify 
# remove --minify when opentelemetry is implemented ?

# runner stage
FROM gcr.io/distroless/base:nonroot

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/server ./server

COPY --chown=nonroot:nonroot public public
# TODO: docker volumes for public ?

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 8000

# TODO: entrypoint for migrations