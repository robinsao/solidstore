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

# Install
Clone the project

```
git clone https://github.com/robinsao/solidstore
```

Then configure

- Auth0:

  - Create a machine-to-machine client. Add `https://localhost:5213, https://localhost:5213/api/auth/callback, http://localhost:3000/api/auth/callback, http://localhost:3000/` to allowed callback URLs,

    and `https://localhost:5213, https://{YOUR_AUTH0_BASE_ISSUER_URL}/v2/logout` to allowed logout URLs.

    Then, follow this [link](https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow/call-your-api-using-resource-owner-password-flow) to setup a authentication flow.

  - Create an API. Configure your scopes/permissions for create, read, delete files. Next, authorize the client to request access tokens.

- S3: Add the following CORS policy:

  ```
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
              "*"
          ],
          "ExposeHeaders": [],
          "MaxAgeSeconds": 3000
      }
  ]
  ```

Next, configure the environment variables for the client app and the server. Follow [this link](https://auth0.com/docs/quickstart/webapp/nextjs/01-login) to configure the client.

You can run the production-version as follows:

```
# Run the production-version
docker compose up -d

# Shutdown
docker compose down
```

There's also the development environment where hot reload is enabled:

```
# Start the development version
docker compose -f compose.dev.yaml up --watch

# Shutdown
docker compose -f compose.dev.yaml down
```

The client should be accessible on `https://localhost:5213` and the server on `https://localhost:5313` regardless if you're running in the normal environment or development environment.

Accessing `https://localhost:5213` on a browser will give you an error. On Chrome, it says "Your connection is not private". This is because the self-signed CA -- which is located at `caddy\data\caddy\pki\authorities\local\root.crt` -- is not trusted. You can choose to add this to your local trust store, or just by pass the certificate check in your browser -- in Chrome, you can click on "Advanced" and then "Proceed to localhost (unsafe)".
