FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY ./server/package.json .
COPY ./server/pnpm-lock.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile


RUN apt-get update && \
    apt-get install -y curl
    
COPY server .

RUN if [ -f .env.docker ]; then cp .env.docker .env; fi

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --start-interval=5s --retries=4 CMD [ "curl", "http://localhost:3010" ]

CMD curl http://192.168.12.5:2020/root.crt > /app/caddy-root.crt && NODE_EXTRA_CA_CERTS=/app/caddy-root.crt pnpm docker-run