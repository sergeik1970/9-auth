FROM node:21-alpine as deps
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm ci

FROM node:21-alpine as builder
COPY . .

COPY --from=deps --chown=builder ./node_modules ./node_modules

RUN npm run build

FROM node:21-alpine as runner

COPY  --from=deps --chown=runner ./package.json ./package.json
COPY  --from=deps --chown=runner ./package-lock.json ./package-lock.json
COPY --from=deps --chown=runner ./node_modules ./node_modules
COPY --from=builder --chown=runner ./dist ./dist
COPY --from=builder --chown=runner ./migrations ./migrations
COPY --from=builder --chown=runner ./typeOrm.config.ts ./typeOrm.config.ts

EXPOSE 3001
ENV NODE_ENV prod

CMD ["npm", "run", "start:prod"]