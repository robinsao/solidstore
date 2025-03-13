apt-get update
apt-get install -y curl ca-certificates
curl http://192.168.0.5:2020/root.crt > /usr/local/share/ca-certificates/caddy-root.crt
update-ca-certificates

NODE_EXTRA_CA_CERTS=/etc/ssl/certs/caddy-root.pem node server.js