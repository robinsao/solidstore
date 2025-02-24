import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import db from "../db";
import { File } from "../entities/file";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const bucketName = process.env.BUCKET_NAME;

export async function getFileDownloadUrl({
  userId,
  fileId,
  s3Client,
  downloadExpirationSeconds,
}: {
  userId: string;
  fileId: string;
  s3Client: S3Client;
  downloadExpirationSeconds: number;
}): Promise<{ url?: string }> {
  let existsRes;
  try {
    existsRes = await db.entityManager.find(File, {
      where: {
        id: fileId,
        ownerid: userId,
      },
    });
  } catch (e) {
    // Error could occur because of fileId is not UUID
    if (e.code === "22P02") {
      throw new Error("Not found");
    } else throw e;
  }

  if (existsRes === null) throw new Error("Not found");

  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: `${userId}/${fileId}`,
    }),
    { expiresIn: downloadExpirationSeconds }
  );

  return { url: url };
}

export async function getFileUploadUrl({
  userId,
  fileId,
  contentType,
  s3Client,
  uploadExpirationSeconds,
}: {
  userId: string;
  fileId: string;
  contentType: string;
  s3Client: S3Client;
  uploadExpirationSeconds: number;
}) {
  const uploadCmd = new PutObjectCommand({
    Bucket: bucketName,
    Key: `${userId}/${fileId}`,
    ContentType: contentType,
  });
  return await getSignedUrl(s3Client, uploadCmd, {
    expiresIn: uploadExpirationSeconds,
  });
}

export async function completeUpload({
  fileName,
  fileId,
  userId,
  parentFolderID,
}: {
  fileName: string;
  fileId: string;
  userId: string;
  parentFolderID?: string;
}) {
  try {
    const parentfolder = new File();
    parentfolder.id = parentFolderID;

    const file = new File();
    file.id = fileId;
    file.name = fileName;
    file.ownerid = userId;
    if (parentFolderID) file.parentfolder = parentfolder;

    await db.entityManager.save(File, file);
  } catch (e) {
    // Error could occur because of fileId is not UUID or parentfolder.idid isn't valid
    if (e.code === "22P02") throw new Error("Not found");
    else throw e;
  }
}

export async function deleteFile({
  userId,
  fileId,
  s3Client,
}: {
  userId: string;
  fileId: string;
  s3Client: S3Client;
}) {
  // Check that the file exists
  let fileDbRes;
  try {
    fileDbRes = await db.entityManager.findOne(File, {
      where: {
        id: fileId,
        ownerid: userId,
      },
    });
  } catch (e) {
    // Error could occur because of fileId is not UUID
    if (e.code === "22P02") throw new Error("Not found");
    else throw e;
  }

  if (fileDbRes === null) throw new Error("Not found");

  // Delete the file from S3
  const _ = await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: `${userId}/${fileId}`,
    })
  );

  // Delete the file from DB
  await db.entityManager.delete(File, fileId);
}
