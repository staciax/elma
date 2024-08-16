FROM node:22-alpine

RUN apk add --update-cache \ 
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

RUN yarn install --production && yarn cache clean

COPY . .

RUN yarn run build

CMD ["yarn", "start"]

EXPOSE 3000