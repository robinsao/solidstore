import { usePathname } from "next/navigation";
import { completeUpload, getUploadUrlAndId } from "./server-actions/file";
import { useContext, useEffect, useState } from "react";
import { ProgressFilesToUpload } from "./types";
import { FilesContext } from "@/components/homepage/Contexts";

/**
 * This hook reads the URL to determine the directory that the user is currently viewing
 *
 * @returns The folder ID of the directory that the user is viewing
 */
function useCurrFolderID() {
  const pathname = usePathname();
  if (!pathname.endsWith("app")) return pathname.split("/").at(-1) || "";
  return "";
}

function useFileUpload() {
  const [progress, setProgress] = useState<ProgressFilesToUpload>(null);
  const filesContext = useContext(FilesContext);
  useEffect(() => {
    if (!filesContext) return;
    filesContext.setFilesUploadProgress(progress);
  }, [progress]);

  async function handleUpload(fd: FormData, currFolderID: string) {
    const filesToUpload = fd.getAll("files") as File[];

    const completed: { name: string; id: string }[] = [];
    const errors: { fileName: string; err: any }[] = [];
    const promises = [];

    for (const f of filesToUpload) {
      // Get presigned URL
      let urlAndId;
      try {
        urlAndId = await getUploadUrlAndId(currFolderID, f.name, f.type);
      } catch (err) {
        errors.push({ fileName: f.name, err });
        continue;
      }

      promises.push(
        new Promise<void>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("loadstart", () => {
            console.log(`Upload started ${f.name}`);
          });

          xhr.upload.addEventListener("progress", (event) => {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgress((prev) => ({
              ...prev,
              [urlAndId.fileId]: {
                name: f.name,
                progress: percentComplete,
              },
            }));
          });

          xhr.upload.addEventListener("loadend", async () => {
            // Complete upload
            try {
              const res = await completeUpload(
                currFolderID,
                urlAndId.fileId,
                f.name
              );
            } catch (e) {
              errors.push({ fileName: f.name, err: e });
              resolve();
              return;
            }

            completed.push({
              name: f.name,
              id: urlAndId.fileId,
            });

            resolve();
          });

          xhr.upload.addEventListener("error", (ev) => {
            errors.push({ fileName: f.name, err: ev });
            resolve();
          });

          xhr.open("PUT", urlAndId.url, true);
          xhr.send(f);
        })
      );
    }

    await Promise.all(promises);
    if (errors.length > 0) {
      throw new AggregateError(
        errors.map((e) => `${e.fileName} - ${e.err}`),
        `${errors.length} Some files failed to upload`
      );
    }

    setProgress(null);

    console.log(`Completed: ${completed.length} files`);
    return completed.map((f) => {
      return {
        id: f.id,
        name: f.name,
        isFolder: false,
      };
    });
  }

  return { progress, isUploading: progress != null, handleUpload };
}

export { useCurrFolderID, useFileUpload };
