FROM caddy:2.10.2

RUN apk update && \
    apk add --no-cache curl

HEALTHCHECK --interval=20s --timeout=5s --start-period=20s --start-interval=5s --retries=3 CMD [ "curl", "http://localhost:2019/pki/ca/local" ]