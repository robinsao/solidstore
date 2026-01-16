"use server";

// import { auth0 } from "@/lib/auth0";
import { cookies, headers } from "next/headers";
import { getToken } from "next-auth/jwt";

// import 'server-only';
export async function getAccessToken() {
  const reqHeaders = await headers();
  const reqCookies = (await cookies()).getAll().map((c) => [c.name, c.value]);

  // Check if we're using HTTPS by looking at the forwarded protocol or request protocol
  const isSecure =
    reqHeaders.get("x-forwarded-proto") === "https" ||
    reqHeaders.get("protocol") === "https";

  const req = {
    headers: Object.fromEntries(reqHeaders),
    cookies: Object.fromEntries(reqCookies),
  };

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: isSecure, // Dynamically set based on protocol
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return token.access_token;
}

async function fetchWithAuthFromServer(url: string, options: RequestInit) {
  // const accessToken = await auth0.getAccessToken();
  const accessToken = await getAccessToken();
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  options.headers = headers;
  return fetch(url, options);
}

export { fetchWithAuthFromServer };
