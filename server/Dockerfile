FROM node:16-alpine AS build_image


# install dependencies
RUN apk update \
    && apk add --no-cache openssl \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apk/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Copy all local files into the image.
COPY . .

RUN npx prisma generate

RUN npm run build

# remove development dependencies
RUN npm prune --production


FROM node:16-alpine

WORKDIR /app
COPY --from=0 /app .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "./build/src/server.js"]
