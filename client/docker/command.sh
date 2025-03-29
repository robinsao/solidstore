#!/bin/bash
curl http://192.168.0.5:2020/root.crt > /app/caddy-root.crt

NODE_EXTRA_CA_CERTS=/app/caddy-root.crt node server.js