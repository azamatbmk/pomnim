FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build --workspace @pomnim/shared \
  && npm run prisma:generate --workspace @pomnim/api \
  && npm run build --workspace @pomnim/api
WORKDIR /repo/apps/api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
