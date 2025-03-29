FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY ./server/package.json .
COPY ./server/pnpm-lock.yaml .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY server .

EXPOSE 3010

RUN apt-get update && \
    apt-get install -y curl

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --start-interval=5s --retries=4 CMD [ "curl", "http://localhost:3010" ]

CMD pnpm docker-run