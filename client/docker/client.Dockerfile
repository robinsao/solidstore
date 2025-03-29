FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update && \
    apt-get install -y curl


FROM base AS nodedeps
WORKDIR /app
COPY ./client/package.json .
COPY ./client/pnpm-lock.yaml .
COPY ./client .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile


FROM nodedeps AS devrunner
EXPOSE 3000

CMD ["sh", "-c", "curl http://192.168.0.5:2020/root.crt > /app/caddy-root.crt && NODE_EXTRA_CA_CERTS=/app/caddy-root.crt pnpm dev"]


FROM nodedeps AS build
WORKDIR /app
COPY client/tsconfig.prod.json ./tsconfig.json
RUN mkdir .next
RUN pnpm build


FROM base AS prodrunner
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=20s --timeout=30s --retries=3 CMD [ "curl", "http://192.168.0.5:2020/root.crt" ]

CMD ["sh", "-c", "curl http://192.168.0.5:2020/root.crt > /app/caddy-root.crt && NODE_EXTRA_CA_CERTS=/app/caddy-root.crt node server.js"]