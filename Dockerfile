ARG NODE_VERSION=22.14.0-alpine
FROM node:${NODE_VERSION} AS base

WORKDIR /app

COPY package.json package-lock.json ./
#ENV NODE_ENV=production
RUN npm install

FROM base AS builder
COPY . .

RUN npm run build

FROM node:${NODE_VERSION} AS runner

USER node

ENV PORT=80

WORKDIR /app

COPY --from=builder /app/ ./

EXPOSE 80

ENTRYPOINT ["npm", "run start"]
