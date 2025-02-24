"use server";
import { fetchWithAuthFromServer } from "@/helpers/backend-helpers";
import { revalidatePath } from "next/cache";

async function createFolder(data: FormData) {
  const name = data.get("name");
  const parentFolderID = data.get("parentFolderID");

  const res = JSON.parse(
    JSON.stringify(
      await fetchWithAuthFromServer(
        `${process.env.BACKEND_PB_DOMAIN_NAME}/folders${
          parentFolderID ? `/${parentFolderID}` : ""
        }/${name}`,
        {
          method: "POST",
        }
      ).then((res) => res.json())
    )
  );

  revalidatePath(`/app/${parentFolderID}`, "page");
  return res;
}

export async function fetchFiles(dir: string) {
  const response = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/folders/${
      dir ? encodeURIComponent(dir) + "/" : ""
    }content`,
    {
      method: "GET",
    }
  )
    .then((res) => res.json())
    .catch((reason) => {
      console.log(reason);
      return { files: [] };
    });

  return JSON.parse(JSON.stringify(response as FilesResponse));
}
interface FilesResponse {
  files: Array<{
    name: string;
    id: string;
    isFolder: boolean;
  }>;
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
  )
    .then((res) => res.text())
    .catch((e) => console.log(e));

  revalidatePath(`/app${parentFolderIDURLSegment}`);
  return res;
}

async function getDownloadUrl(id: string) {
  let err;

  const { url } = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/files/${id}/download-url`,
    { method: "GET" }
  ).then(async (r) => {
    if (r.status >= 400) {
      err = await r.text();
      console.log(err);
      return { url: "" };
    }
    return r.json();
  });

  if (err) return { err: err };

  return JSON.parse(JSON.stringify({ url: url }));
}

async function getUploadUrlAndId(
  parentFolderID: string,
  fileName: string,
  fileType: string
) {
  const parentFolderIDURLSegment = parentFolderID ? `/${parentFolderID}` : "";

  // Get presigned URL
  const fetchUrlHeaders = new Headers();
  fetchUrlHeaders.set("Content-Type", fileType);

  let err;
  const res = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/files${parentFolderIDURLSegment}/${fileName}/upload-url`,
    {
      headers: fetchUrlHeaders,
      method: "GET",
    }
  )
    .then(async (res) => {
      if (res.status >= 400) {
        err = await res.json();
        console.log(
          `file-server-actions.uploadFile: Requesting presigned URL gave ${res.status} because ${err}`
        );
        return Promise.resolve({ url: null, id: null });
      }
      return res.json();
    })
    .catch((res) => {
      err = res;
      console.log(
        `file-server-actions.uploadFile: Requesting presigned URL errored: ${res}`
      );
    });

  if (err) return JSON.parse(JSON.stringify({ err: err }));
  return JSON.parse(JSON.stringify(res));
}

async function completeUpload(
  parentFolderID: string,
  fileId: string,
  fileName: string
) {
  const parentFolderIDURLSegment = parentFolderID ? `/${parentFolderID}` : "";

  let err;
  await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/files${parentFolderIDURLSegment}/${fileId}/upload-completion`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileName }),
    }
  ).then(async (res) => {
    if (res.status >= 400) {
      err = await res.text();
      console.log(
        `file-server-actions.uploadFile: Finishing upload to presigned URL gave ${res.status}, ${err}`
      );
    }
  });

  if (err) return JSON.parse(JSON.stringify({ err: err }));

  revalidatePath(`/app${parentFolderID}`);
  return JSON.parse(JSON.stringify({}));
}

export {
  createFolder,
  deleteFileItem,
  getUploadUrlAndId,
  completeUpload,
  getDownloadUrl,
};
