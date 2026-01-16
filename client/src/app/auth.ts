// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import NextAuth from "next-auth";
import Auth0 from "next-auth/providers/auth0";
import Keycloak from "next-auth/providers/keycloak";

function computeAuthTokenEndpoint(): string | undefined {
  if (process.env.AUTH_STRATEGY!.toLowerCase() === "keycloak") {
    return `${process.env.AUTH_ISSUER}/protocol/openid-connect/token`;
  }

  return `${process.env.AUTH_ISSUER}/oauth/token`;
}

const auth0Provider = Auth0({
  authorization: {
    params: {
      scope: process.env.AUTH_SCOPE,
      audience: process.env.AUTH_AUDIENCE,
    },
  },
  clientId: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  issuer: process.env.AUTH_ISSUER,
});

const keycloakProvider = Keycloak({
  authorization: {
    params: {
      scope: process.env.AUTH_SCOPE,
      audience: process.env.AUTH_AUDIENCE,
      prompt: "login",
    },
    url: `${process.env.AUTH_ISSUER}/protocol/openid-connect/auth`,
  },
  clientId: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  issuer: process.env.AUTH_ISSUER,
  token: computeAuthTokenEndpoint(),
  userinfo: `${process.env.AUTH_ISSUER}/protocol/openid-connect/userinfo`,
  jwks_endpoint: `${process.env.AUTH_ISSUER}/protocol/openid-connect/certs`,
  wellKnown: `${process.env.AUTH_ISSUER}/.well-known/openid-configuration`,
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(process.env.AUTH_STRATEGY!.toLowerCase() === "auth0"
      ? [auth0Provider]
      : []),
    ...(process.env.AUTH_STRATEGY!.toLowerCase() === "keycloak"
      ? [keycloakProvider]
      : []),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // First-time login, save the `access_token`, its expiry and the `refresh_token`
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
        };
      } else if (Date.now() < token.expires_at * 1000) {
        // Subsequent logins, but the `access_token` is still valid
        return token;
      } else {
        // Subsequent logins, but the `access_token` has expired, try to refresh it
        if (!token.refresh_token) throw new TypeError("Missing refresh_token");

        try {
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await fetch(computeAuthTokenEndpoint(), {
            method: "POST",
            body: new URLSearchParams({
              client_id: process.env.AUTH_CLIENT_ID!,
              client_secret: process.env.AUTH_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refresh_token!,
            }),
          });

          const tokensOrError = await response.json();

          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          return {
            ...token,
            access_token: newTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
            // Some providers only issue refresh tokens once, so preserve if we did not get a new one
            refresh_token: newTokens.refresh_token
              ? newTokens.refresh_token
              : token.refresh_token,
          };
        } catch (error) {
          console.error("Error refreshing access_token", error);
          // If we fail to refresh the token, return an error so we can handle it on the page
          token.error = "RefreshTokenError";
          return token;
        }
      }
    },
    async session({ session, token }) {
      session.error = token.error;
      return session;
    },
  },
});
