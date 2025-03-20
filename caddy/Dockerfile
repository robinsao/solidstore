FROM caddy

EXPOSE 5213
EXPOSE 5313
EXPOSE 2000

RUN apk update && \
    apk add --no-cache curl

HEALTHCHECK --interval=20s --timeout=5s --start-period=20s --start-interval=5s --retries=3 CMD [ "curl", "http://localhost:2019/pki/ca/local" ]