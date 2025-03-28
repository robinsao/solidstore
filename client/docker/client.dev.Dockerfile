FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY ./client/package.json .
COPY ./client/pnpm-lock.yaml .
COPY ./client .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY ./client/docker/command.dev.sh .

RUN apt-get update && \
    apt-get install -y curl ca-certificates

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=30s --retries=3 CMD [ "curl", "http://192.168.0.5:2020/root.crt" ]

CMD ["./command.dev.sh"]