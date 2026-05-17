FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG VITE_API_URL=""
ARG VITE_TURNSTILE_SITE_KEY=""
RUN printf "VITE_API_URL=%s\nVITE_TURNSTILE_SITE_KEY=%s\n" "$VITE_API_URL" "$VITE_TURNSTILE_SITE_KEY" > .env.production
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
