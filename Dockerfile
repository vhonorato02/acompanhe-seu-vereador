# Image for the VPS copy of the portal (platform contract: standalone Next.js on $PORT,
# non-root, read-only root, health at /api/health). Built only in GitHub Actions.
# The data is NOT collected here: `npm run espelhar` must run before `docker build`, filling
# data/generated, public/dados and public/fotos from the canonical site's open data.

FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN test -s data/generated/dataset.json || { echo "Rode npm run espelhar antes do build da imagem"; exit 1; }
# Straight to next build: the prebuild collector is for the Vercel build only.
RUN ESPELHO=1 npx next build

FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    ESPELHO=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/data/generated ./data/generated
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/health" || exit 1
CMD ["node", "server.js"]
