import { IsNull } from "typeorm";
import db from "../db";
import { File } from "../entities/file";

export async function getContent(ownerId: string, folderId?: string) {
  try {
    return await db.entityManager.find(File, {
      where: {
        parentfolder: { id: folderId ? folderId : IsNull() },
        ownerid: ownerId,
      },
    });
  } catch (e) {
    // Error could occur if folderId isn't a UUID
    if (e.code === "22P02") throw new Error("Not found");
    throw e;
  }
}

export async function createFolder({
  id,
  ownerId,
  parentFolderId,
  name,
}: {
  name: string;
  id: string;
  ownerId: string;
  parentFolderId?: string;
}) {
  const dbRes = await db.entityManager.findOne(File, {
    where: {
      ownerid: ownerId,
      name,
    },
  });

  if (dbRes !== null) throw new Error("Already exists");

  try {
    const folder = db.entityManager.create(File, {
      name: name,
      ownerid: ownerId,
      id: id,
      type: "folder",
      parentfolder: { id: parentFolderId },
    });
    await db.entityManager.save(File, folder);
  } catch (e) {
    if (e.code === "22P02") throw new Error("Not found");
    throw e;
  }
}

export async function deleteFolder(fileId: string) {
  try {
    await db.entityManager.delete(File, fileId);
  } catch (e) {
    if (e.code === "22P02") throw new Error("Not found");
    throw e;
  }
}
