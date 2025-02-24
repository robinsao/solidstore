import { Router, Request, Response, NextFunction } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import { StatusCodes } from "http-status-codes";
import {
  completeUpload,
  deleteFile,
  getFileDownloadUrl,
  getFileUploadUrl,
} from "../services/file.service";
import { checkIsOwner } from "../middlewares/auth";
import { requiredScopes } from "express-oauth2-jwt-bearer";

// S3 configuration
const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
});
// Maximum time of multipart file uplaods
const UPLOAD_URL_EXPIRATION_SECONDS = 120;
const DOWNLOAD_URL_EXPIRATION_SECONDS = 120;

// Routes
const router = Router();

// File downloads
router.get(
  "/:fileId/download-url",
  requiredScopes(process.env.READ_FILES_SCOPE),
  checkIsOwner("fileId"),
  async (req, res: Response, _) => {
    const { fileId } = req.params;
    const userId = req.user;

    try {
      const { url } = await getFileDownloadUrl({
        userId,
        fileId,
        s3Client,
        downloadExpirationSeconds: DOWNLOAD_URL_EXPIRATION_SECONDS,
      });

      res.status(200).send({ url });
    } catch (e) {
      if (e.message === "Not found") res.sendStatus(StatusCodes.NOT_FOUND);
      else res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
);

// Finishes a file upload
router.post(
  "/:parentFolderID?/:fileId/upload-completion",
  requiredScopes(process.env.CREATE_FILES_SCOPE),
  async (req, res, _) => {
    const { fileId } = req.params;
    const userId = req.user;
    const fileName = req.body.fileName;
    try {
      await completeUpload({
        fileName,
        fileId,
        userId,
        parentFolderID: req.params.parentFolderID,
      });
      res.sendStatus(StatusCodes.CREATED);
    } catch (e) {
      if (e.message === "Not found") res.sendStatus(StatusCodes.NOT_FOUND);
      else {
        res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
      }
    }
  }
);

// Get file upload presigned url
router.get(
  "/:parentFolderID?/:fileName/upload-url",
  requiredScopes(process.env.CREATE_FILES_SCOPE),
  async (req, res, _) => {
    const { fileName } = req.params;
    const userId = req.user;
    const contentType = req.headers["content-type"];
    const fileId = crypto.randomUUID();

    if (!fileName) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    try {
      const url = await getFileUploadUrl({
        userId,
        fileId,
        contentType,
        s3Client,
        uploadExpirationSeconds: UPLOAD_URL_EXPIRATION_SECONDS,
      });
      res.status(StatusCodes.OK).send({ url, fileId });
    } catch (_) {
      res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
);

async function handleFileDelete(req: Request, res: Response, _: NextFunction) {
  const { fileId } = req.params;
  const userId = req.user;

  try {
    await deleteFile({ userId, fileId, s3Client });
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (e) {
    if (e.message === "Not found") {
      res.sendStatus(StatusCodes.NOT_FOUND);
      return;
    }
    console.error(e);
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

router.delete(
  "/:fileId",
  requiredScopes(process.env.DELETE_FILES_SCOPE),
  checkIsOwner("fileId"),
  handleFileDelete
);

export { router as default, handleFileDelete };
