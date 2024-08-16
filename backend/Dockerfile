FROM oven/bun:1.1

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
CMD ["bun", "src/index.ts"]

EXPOSE 8000