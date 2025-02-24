import express, { json } from "express";
import fileRouter from "./controllers/file";
import folderRouter from "./controllers/folder";
import fileItemRouter from "./controllers/file-item";
import { auth } from "express-oauth2-jwt-bearer";
import { accessToken, user } from "./middlewares/auth";
import cors from "cors";

const app = express();

const verifyAccessToken = auth({
  audience: process.env.AUTH0_API_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

app.use(cors({}));

app.use(json());

app.use(accessToken());

app.use(user());

app.use("/fileitems", verifyAccessToken, fileItemRouter);

app.use("/files", verifyAccessToken, fileRouter);

app.use("/folders", verifyAccessToken, folderRouter);

app.get("/", (_, res) => {
  res.sendStatus(200);
});

export default app;
