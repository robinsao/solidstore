"use server";
import { getAccessToken } from "@auth0/nextjs-auth0";

async function fetchWithAuthFromServer(url: string, options: RequestInit) {
  const accessToken = (await getAccessToken()).accessToken;
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  options.headers = headers;
  return fetch(url, options);
}

export { fetchWithAuthFromServer };
