FROM node:22-alpine
WORKDIR /repo
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/mobile/package.json apps/mobile/package.json
RUN npm ci --workspace @pomnim/web --include-workspace-root --no-audit --no-fund
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN npm run build --workspace @pomnim/shared && npm run build --workspace @pomnim/web
WORKDIR /repo/apps/web
ENV HOSTNAME=0.0.0.0
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
