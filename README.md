# Description

A simple cloud storage app.

![](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDNrOGQzdzhvMmk0bjIzeWp3YmphN280NnV6ZHc1dTcwN2s3bnNsOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7UHwWI5BikT2HNvzGz/giphy.gif)

This project uses:

- Next.js for the frontend
- Express.js for the backend
- Auth0 for authentication
- [Caddy](https://caddyserver.com/) to serve https locally by creating reverse-proxies for the frontend and the backend; integration with Auth0 in Next.js doesn't work properly without HTTPS, so that's why Caddy is used.
- An S3 bucket to store files.
- and, PostgreSQL to store files' metadata.

You can opt-in to use `localstack` and `keycloak` as well to emulate AWS and Auth0 locally.

Table of contents:

- [Install](#install)
  - [Use AWS and Auth0](#use-aws-and-auth0)
  - [Use LocalStack and Keycloak](#use-localstack-and-keycloak)
- [Run](#run)
  - [AWS + Auth0](#aws--auth0)
  - [LocalStack + Keycloak](#localstack--keycloak)
- [View and interact](#view-and-interact)
- [Architecture](#architecture)
  - [SSL](#ssl)
  - [Authentication](#authentication)
- [Errors](#errors)
  - [localstack script not found](#localstack-script-not-found)

# Install

Clone the project

```sh
git clone https://github.com/robinsao/solidstore

pnpm i
```

If you don't have `pnpm`, you can install it with `npm install -g pnpm@latest-10`

You have 2 ways to run the project:

- [Integration with AWS and Auth0](#use-aws-and-auth0)
- [Or run everything locally by emulating AWS with `localstack` and using `keycloak` as local replacement for Auth0](#use-localstack-and-keycloak)

## Use AWS and Auth0

- Auth0:

  - Create a regular web app (RWA) client.

    Add `https://localhost:5213/api/auth/callback/auth0,https://localhost:5213/api/auth/callback` to allowed callback URLs, and `https://localhost:5213` to allowed logout URLs.

    If you're planning to run the production version of this project, repeat the steps above but replace the hostname with `client.solidstore.localhost`

  - Create an API. Configure your scopes/permissions for create, read, delete files. Next, authorize the client to request access tokens from the API.

- S3: Add the following CORS policy.

  ```json
  [
      {
          "AllowedHeaders": [
              "*"
          ],
          "AllowedMethods": [
              "PUT",
              "POST",
              "DELETE",
              "GET"
          ],
          "AllowedOrigins": [
            "https://localhost:5213", "https://localhost:5313"
          ],
          "ExposeHeaders": [],
          "MaxAgeSeconds": 3000
      }
  ]
  ```

  Additionally, add `https://client.solidstore.localhost` and `https://server.solidstore.localhost` to the `AllowedOrigins` field if you're planning on running the production version of this project.

Next, configure the environment variables for the client app and the server. Follow [this link](https://auth0.com/docs/quickstart/webapp/nextjs) to configure the client.

`.env.docker` files are also supported.

When referencing docker containers, you can use `http://container-name:PORT`, but it's recommended to use their static IP addresses as seen in the env template files. This is because there are multiple compose files in this project, each of which uses different container names but use the same IP subnet range.

## Use LocalStack and Keycloak

Configure the environment variables, and that's it!

# Run

Prerequisites:

- Make sure that you don't have a proxy configured in your browser. This means things like VPNs as browser extensions.
- Generate certificates using the `./caddy-init.sh` script (note that you have to type in your password since it calls a sudo operation internally)

  ```sh
  # For dev env:
  ./caddy-init.sh

  # For prod env:
  ./caddy-init.sh prod
  ```

**_Note: Always stop `compose` with Ctrl+C once for graceful shutdowns instead of pressing Ctrl+C multiple times_**

## AWS + Auth0

You can run the production-version as follows:

```sh
# Run the production-version
docker compose up -d

# Shutdown
docker compose down
```

There's also the development environment:

```sh
# Start the development version
docker compose -f compose.dev.yaml up

# Shutdown
docker compose -f compose.dev.yaml down

# After the containers are running, run your frontend and backend separately on your host machine:
cd <replace_with_client_dir_or_server_dir>
pnpm dev
```

The dev environment doesn't run the frontend and backend as containers. Next.js v16 doesn't recommend that. Express.js could run as a container with hot reloading; however, on Windows, I've tested different hot reload packages like nodemon, ts-node-dev, etc. and they seem to have problems emulating Unix process signals (SIGTERM, SIGINT, SIGKILL, etc). So, for now, hot reloading isn't available in the backend; it's run with plain `ts-node`.

## LocalStack + Keycloak

If you wanna use `localstack` and `keycloak`, run

```sh
# use the "compose.zero-int.yaml" file to run the production version
docker compose -f compose.zero-int.dev.yaml up --watch

# zero-int stands for zero integration.

# Shutdown with
docker compose -f compose.zero-int.dev.yaml down

# If you're using the development version, you then need to run your frontend and backend separately on your host machine after the containers are started:
cd <replace_with_client_dir_or_server_dir>
pnpm dev
```

It's a bummer `localstack` community version doesn't support persistence. There are docker images such as [this one](https://github.com/GREsau/localstack-persist) that attempts to solve this problem, but it's built by the community making it risky.

There are 2 users created by default; their usernames are `testuser` and `testuser2`. Both of their passwords are `test`.

# View and interact

The client should be accessible on `https://localhost:5213`, the server on `https://localhost:5313`, and keycloak on `https://localhost:8443` if you're running in the development environment. Otherwise, it's `https://client.solidstore.localhost` and `https://server.solidstore.localhost`, `https://keycloak.solidstore.localhost` respectively.

Visiting on a browser will give you an error. On Chrome, it says "Your connection is not private". This is because the self-signed CA -- which is located at `caddy\data\caddy\pki\authorities\local\root.crt` -- is not trusted. You can choose to add this to your local trust store, or just bypass the certificate check in your browser -- in Chrome, you can click on "Advanced" and then "Proceed to localhost (unsafe)".

# Architecture

## SSL

The frontend, the backend, and keycloak are behind reverse proxies managed by Caddy.

In browsers, all domains that end with `*.localhost` automatically resolve to plain `localhost` or `127.0.0.1`. This is why it's possible to access the `https://*.solidstore.localhost` domains this project uses without any manual configuration like adding DNS records for these domains to the `hosts` file on the OS level.

However, it's possible to register them under different domain scheme. There are public DNS records out there that point to `localhost`. For example, `*.localtest.me`, `*.lacolhost.com`. For a full list, you can find it [here](https://gist.github.com/tinogomes/c425aa2a56d289f16a1f4fcb8a65ea65). However, these records are not reliable and can be changed at any time.

As for `https://s3.localhost.localstack.cloud`, the DNS record points to localhost with its own SSL certificate issued by CAs that browsers trust inherently.

## Authentication

The project supports Auth0 and Keycloak.

The frontend uses `next-auth` -- an auth library designed for Next.js -- and it supports generic OIDC providers as well as popular OIDC providers.

The same goes for the backend. It uses [`express-oauth2-jwt-bearer`](https://www.npmjs.com/package/express-oauth2-jwt-bearer), which is maintained by the Auth0 team, but is very versatile and can work with other OIDC providers.

For Keycloak, the scopes configured in this project use simple non-role-based scope mappers. You can learn more about it [here](https://www.keycloak.org/docs/latest/server_admin/index.html#_audience_hardcoded).

# Errors

### localstack script not found

```text
Running READY script /etc/localstack/init/ready.d/localstack-prod-setup.sh
Traceback (most recent call last):
...
FileNotFoundError: [Errno 2] No such file or directory: '/etc/localstack/init/ready.d/localstack-prod-setup.sh
```

If you get the above error, and you're on Windows, it's most likely that the `localstack-setup.sh` or `localstacks-setup-prod.sh` scripts, which are meant to be copied into the localstack containers, have CRLF sequence instead LF sequence. `localstack` does not like this, and it gives you an error.

To fix this, just go to both files, and change the line endings. In VS Code, you can do so by clicking on the CRLF or LF buttons in the bottom right corner.

