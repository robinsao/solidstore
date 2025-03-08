FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS nodedeps
WORKDIR /app
COPY client .
COPY client/tsconfig.prod.json ./tsconfig.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS runner
WORKDIR /app
COPY --from=nodedeps /app/.next/standalone ./
COPY --from=nodedeps /app/.next/static ./.next/static
COPY --from=nodedeps /app/public ./public

COPY ./caddy/data/caddy/pki/authorities/local/root.crt /usr/local/share/ca-certificates/caddy-root.crt
RUN apt-get update
RUN apt-get install -y ca-certificates
RUN update-ca-certificates

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD NODE_EXTRA_CA_CERTS=/etc/ssl/certs/caddy-root.pem node server.js