import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { decode, JwtPayload } from "jsonwebtoken";
import { isOwner } from "../services/file-item.service";
import { getUserIdFromAccessToken } from "../utils/auth";

// Set req.accessToken to the access token passed in the header if the token exists
export function accessToken() {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      next();
      return;
    }

    // Skip the "Bearer " word
    req.accessToken = decode(
      req.headers.authorization.slice(7),
      {}
    ) as JwtPayload;
    next();
  };
}

// Set req.user to the "sub" claim in the access token if the token exists
export function user() {
  return (req: Request, _: Response, next: NextFunction) => {
    if (req.accessToken) req.user = getUserIdFromAccessToken(req.accessToken);
    next();
  };
}

export function checkIsOwner(paramsFileIdName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.accessToken) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    if (isOwner(req.user, req.params[paramsFileIdName])) next();
    else res.sendStatus(StatusCodes.UNAUTHORIZED);
  };
}
