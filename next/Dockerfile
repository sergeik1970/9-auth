FROM node:21-alpine as deps

WORKDIR /app

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm ci

FROM node:21-alpine as builder

WORKDIR /app

COPY . .
COPY --from=deps --chown=builder /app/node_modules ./node_modules
ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

FROM node:21-alpine as runner

WORKDIR /opt/next

COPY --from=deps --chown=runner /app/package.json ./package.json
COPY --from=deps --chown=runner /app/package-lock.json ./package-lock.json
COPY --from=deps --chown=runner /app/node_modules ./node_modules
COPY --from=builder --chown=runner /app/.next ./.next
COPY --from=builder --chown=runner /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]