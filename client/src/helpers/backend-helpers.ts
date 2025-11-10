"use server";
import { auth0 } from "@/lib/auth0";

async function fetchWithAuthFromServer(url: string, options: RequestInit) {
  const accessToken = await auth0.getAccessToken();
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken.token}`);
  options.headers = headers;
  return fetch(url, options);
}

export { fetchWithAuthFromServer };
