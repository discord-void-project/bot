FROM node:23-alpine AS builder

WORKDIR /bot

COPY package.json ./
COPY tsconfig.json ./
COPY tsup.config.ts ./

RUN npm install

COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npx prisma generate

COPY src ./src

RUN npx tsup && npx tsc-alias

FROM node:23-alpine

WORKDIR /bot

COPY --from=builder /bot/package.json ./

COPY --from=builder /bot/node_modules ./node_modules
COPY --from=builder /bot/build ./src

COPY --from=builder /bot/prisma ./prisma

CMD ["node", "src/index.js"]