FROM postgres

ENV POSTGRES_PASSWORD=a
ENV POSTGRES_USER=postgres
ENV POSTGRES_DB=solidstore

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD [ "sh", "-c", "pg_isready -q -U postgres -d solidstore && exit 0 || exit 1" ]