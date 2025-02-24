import { NextFunction, Request, Response, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import {
  createFolder,
  deleteFolder,
  getContent,
} from "../services/folder.service";
import { getPath } from "../services/file-item.service";

const router = Router({});

router.get(
  "/:folderId/path",
  requiredScopes(process.env.READ_FILES_SCOPE),
  async (req: Request, res: Response, _: NextFunction) => {
    const userId = req.user;
    const folderId = req.params.folderId || "";

    try {
      res
        .status(StatusCodes.OK)
        .send(await getPath({ userId, fileItemId: folderId }));
    } catch (e) {
      if (e.message === "Not found") res.sendStatus(StatusCodes.NOT_FOUND);
      else res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
);

router.get(
  "/:folderId?/content",
  requiredScopes(process.env.READ_FILES_SCOPE),
  async (req: Request, res: Response, _: NextFunction) => {
    const ownerId = req.user;
    const folderId = req.params.folderId || null;

    try {
      const dbRes = await getContent(ownerId, folderId);
      const resBody = {
        files: dbRes.map((f) => {
          return {
            name: f.name,
            id: f.id,
            isFolder: f.type === "folder",
          };
        }),
      };

      res.status(200).send(resBody);
    } catch (e) {
      if (e.message === "Not found") res.sendStatus(StatusCodes.NOT_FOUND);
      else res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
);

router.post(
  "/:parentFolderId?/:name",
  requiredScopes(process.env.CREATE_FILES_SCOPE),
  async (req: Request, res: Response, _: NextFunction) => {
    const { name } = req.params;
    const parentFolderId = req.params.parentFolderId;
    const ownerId = req.user;

    try {
      const id = crypto.randomUUID();
      await createFolder({ id, ownerId, parentFolderId, name });
      res.status(StatusCodes.CREATED).send({ id });
    } catch (e) {
      if (e.message === "Already exists") res.sendStatus(StatusCodes.CONFLICT);
      else if (e.message === "Not found") res.sendStatus(StatusCodes.NOT_FOUND);
      else res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
);

async function handleFolderDelete(
  req: Request,
  res: Response,
  _: NextFunction
) {
  const { fileId } = req.params;

  try {
    await deleteFolder(fileId);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (e) {
    if (e.message === "Not found") res.sendStatus(StatusCodes.NOT_FOUND);
    else res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

router.delete(
  "/:fileId",
  requiredScopes(process.env.READ_FILES_SCOPE),
  handleFolderDelete
);

type FolderContentRes = Array<{
  id: string;
  name: string;
  type: string;
}>;

export { router as default, handleFolderDelete, FolderContentRes };
