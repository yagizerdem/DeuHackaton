# Backend image. Railway builds a Dockerfile at the repo root without any
# configuration (the monorepo has no start script for Railpack to find).
FROM node:22-alpine AS build
WORKDIR /app

# npm ci checks every workspace, so each one needs its package.json
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/dto/package.json packages/dto/
COPY packages/validators/package.json packages/validators/
RUN npm ci --workspace=@DeparkHackaton/backend --include-workspace-root

COPY packages packages
COPY apps/backend apps/backend
# the packages are imported through their dist folders, build them first
RUN npx tsc -b packages/shared packages/dto packages/validators \
    && npm run build -w @DeparkHackaton/backend \
    && npm prune --omit=dev --workspace=@DeparkHackaton/backend --include-workspace-root

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/packages packages
COPY --from=build /app/apps/backend apps/backend

USER node
EXPOSE 3000
CMD ["node", "apps/backend/dist/src/server.js"]
