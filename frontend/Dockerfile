ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION}

RUN apk add --update-cache \ 
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn install --production && yarn cache clean

COPY . .

RUN yarn run build

EXPOSE 3000

CMD ["yarn", "start"]
