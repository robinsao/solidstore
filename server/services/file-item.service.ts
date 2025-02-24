import { S3Client } from "@aws-sdk/client-s3";
import db from "../db";
import { File } from "../entities/file";
import { deleteFile } from "./file.service";
import { deleteFolder } from "./folder.service";

export async function getPath({
  userId,
  fileItemId,
}: {
  userId: string;
  fileItemId: string;
}) {
  let currAncestor: File;
  try {
    currAncestor = await db.entityManager.findOne(File, {
      where: {
        ownerid: userId,
        id: fileItemId,
      },
      relations: {
        parentfolder: true,
      },
    });
  } catch (e) {
    // Error could occur if fileItemId isn't a UUID
    if (e.code === "22P02") throw new Error("Not found");
    throw e;
  }
  if (currAncestor === null) throw new Error("Not found");

  const path = [];
  while (currAncestor) {
    path.unshift({ id: currAncestor.id, name: currAncestor.name });
    if (!currAncestor.parentfolder) break;
    currAncestor = await db.entityManager.findOne(File, {
      where: {
        ownerid: userId,
        id: currAncestor.parentfolder.id,
      },
      relations: {
        parentfolder: true,
      },
    });
  }

  return { path };
}

export async function deleteFileOrFolder({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  let fileDbRes;
  try {
    fileDbRes = await db.entityManager.findOne(File, {
      where: {
        id,
      },
    });
  } catch (e) {
    // id isn't UUID
    if (e.code === "22P02") throw new Error("Not found");
    throw e;
  }

  if (fileDbRes === null) throw new Error("Not found");

  if (fileDbRes.type === "folder") await deleteFolder(id);
  else await deleteFile({ userId, fileId: id, s3Client: new S3Client() });
}

export async function isOwner(userId: string, fileId: string) {
  return (
    userId ===
    (await db.entityManager.findOne(File, { where: { id: fileId } })).ownerid
  );
}
