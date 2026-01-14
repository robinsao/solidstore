"use server";
import { fetchWithAuthFromServer } from "@/helpers/backend-helpers";
import { revalidatePath } from "next/cache";
import {
  FetchFolderPathResponse,
  CreateFolderResponse,
  FetchFilesResponse,
  DownloadUrlResponse,
  UploadUrlAndIdResponse,
} from "./types";

async function fetchFolderPath(
  folderId: string
): Promise<FetchFolderPathResponse> {
  if (!folderId) return [];
  const res = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/folders/${folderId}/path`,
    { method: "GET" }
  );
  if (!res.ok)
    throw new Error(
      `Failed to fetch folder path for folder ID ${folderId} - ${await res.text()}`
    );

  const path = await res.json();

  return path?.path;
}

async function createFolder(data: FormData): Promise<CreateFolderResponse> {
  const name = data.get("name");
  const parentFolderID = data.get("parentFolderID");

  const res = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/folders${
      parentFolderID ? `/${parentFolderID}` : ""
    }/${name}`,
    {
      method: "POST",
    }
  );
  if (!res.ok)
    throw new Error(`Failed to create folder ${name} - ${await res.text()}`);

  const resData = JSON.parse(JSON.stringify(await res.json()));

  revalidatePath(`/app/${parentFolderID}`, "page");
  return resData;
}

export async function fetchFiles(dir: string): Promise<FetchFilesResponse> {
  const res = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/folders/${
      dir ? encodeURIComponent(dir) + "/" : ""
    }content`,
    {
      method: "GET",
    }
  );
  if (!res.ok)
    throw new Error(
      `Failed to fetch files in folder ${dir} - ${await res.text()}`
    );
  const resData = JSON.parse(JSON.stringify(await res.json()));

  return resData;
}

async function deleteFileItem({
  fileId,
  parentFolderID,
}: {
  fileId: string;
  parentFolderID: string;
}) {
  const parentFolderIDURLSegment = parentFolderID ? `/${parentFolderID}` : "";
  const res = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/fileitems/${fileId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok)
    throw new Error(
      `Failed to delete file item ${fileId} - ${await res.text()}`
    );
  const resData = JSON.parse(JSON.stringify(await res.json()));

  revalidatePath(`/app${parentFolderIDURLSegment}`);
  return resData;
}

async function getDownloadUrl(id: string): Promise<DownloadUrlResponse> {
  const res = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/files/${id}/download-url`,
    { method: "GET" }
  );
  if (!res.ok)
    throw new Error(
      `Failed to get download URL for file ID ${id} - ${await res.text()}`
    );
  const { url } = await res.json();

  return JSON.parse(JSON.stringify({ url: url }));
}

async function getUploadUrlAndId(
  parentFolderID: string,
  fileName: string,
  fileType: string
): Promise<UploadUrlAndIdResponse> {
  const parentFolderIDURLSegment = parentFolderID ? `/${parentFolderID}` : "";

  // Get presigned URL
  const fetchUrlHeaders = new Headers();
  fetchUrlHeaders.set("Content-Type", fileType);

  const res = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/files${parentFolderIDURLSegment}/${fileName}/upload-url`,
    {
      headers: fetchUrlHeaders,
      method: "GET",
    }
  );

  if (!res.ok)
    throw new Error(
      `Failed to get upload URL for file ${fileName} - ${await res.text()}`
    );

  const resData = await res.json();
  return JSON.parse(JSON.stringify(resData));
}

async function completeUpload(
  parentFolderID: string,
  fileId: string,
  fileName: string
): Promise<void> {
  const parentFolderIDURLSegment = parentFolderID ? `/${parentFolderID}` : "";

  const res = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/files${parentFolderIDURLSegment}/${fileId}/upload-completion`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileName }),
    }
  );
  if (!res.ok)
    throw new Error(
      `Failed to complete upload for file ID ${fileId} - ${await res.text()}`
    );

  revalidatePath(`/app${parentFolderID}`);
  return JSON.parse(JSON.stringify({}));
}

export {
  fetchFolderPath,
  createFolder,
  deleteFileItem,
  getUploadUrlAndId,
  completeUpload,
  getDownloadUrl,
};
