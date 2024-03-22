FROM node:21-alpine as deps
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm ci

FROM node:21-alpine as builder
COPY . .

COPY --from=deps --chown=builder ./node_modules ./node_modules
ENV NEXT_PUBLIC_API_URL ''
RUN npm run build

FROM node:21-alpine as runner

COPY --from=deps --chown=runner ./package.json ./package.json
COPY --from=deps --chown=runner ./package-lock.json ./package-lock.json
COPY --from=deps --chown=runner ./node_modules ./node_modules
COPY --from=builder --chown=runner ./.next ./.next

EXPOSE 3000

CMD ["npm", "run", "start"]