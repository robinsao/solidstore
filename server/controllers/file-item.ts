import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { requiredScopes } from "express-oauth2-jwt-bearer";
import { deleteFileOrFolder, getPath } from "../services/file-item.service";

const router = Router();

router.get(
  "/:fileItemId/path",
  requiredScopes(process.env.READ_FILES_SCOPE),
  async (req, res, _) => {
    const userId = req.user;
    const fileItemId = req.params.fileItemId || "";

    try {
      res
        .status(StatusCodes.OK)
        .send(await getPath({ userId, fileItemId: fileItemId }));
    } catch (e) {
      if (e.message === "Not found") res.sendStatus(StatusCodes.NOT_FOUND);
      else res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
);

router.delete(
  "/:fileItemId",
  requiredScopes(process.env.DELETE_FILES_SCOPE),
  async (req, res, _) => {
    const { fileItemId } = req.params;
    const ownerId = req.user;

    // Check that the file exists
    try {
      await deleteFileOrFolder({ id: fileItemId, userId: ownerId });
      res.sendStatus(StatusCodes.NO_CONTENT);
    } catch (e) {
      if (e.message === "Not found") res.sendStatus(StatusCodes.NOT_FOUND);
      else res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
);

export default router;
