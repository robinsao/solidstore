FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS nodedeps
WORKDIR /app
COPY client .
COPY client/tsconfig.prod.json ./tsconfig.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN mkdir .next
RUN pnpm build

FROM base AS runner
WORKDIR /app
COPY --from=nodedeps /app/.next/standalone ./
COPY --from=nodedeps /app/.next/static ./.next/static
COPY --from=nodedeps /app/public ./public
COPY client/docker/command.sh .

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["./command.sh"]