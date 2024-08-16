ARG BUN_VERSION=1.1
FROM oven/bun:${BUN_VERSION}

RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production && bun pm cache clean

COPY src src
COPY public public
COPY tsconfig.json .

ENV NODE_ENV production

EXPOSE 8000

CMD ["bun", "src/index.ts"]
