import { JwtPayload } from "jsonwebtoken";

export function getUserIdFromAccessToken(accessToken: JwtPayload) {
  return accessToken.sub?.slice(6);
}
