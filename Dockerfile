FROM node:12-alpine

COPY package*.json ./
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
