import { JwtPayload } from "jsonwebtoken";
declare global {
  namespace Express {
    interface Request {
      accessToken: JwtPayload | null;
      user: string | null;
    }
  }
}
