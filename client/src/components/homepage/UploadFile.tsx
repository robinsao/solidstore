"use client";
import { ChangeEvent, MouseEvent, useContext, useRef, useState } from "react";

import {
  completeUpload,
  getUploadUrlAndId,
} from "@/helpers/server-actions/file";
import { useCurrFolderID } from "@/helpers/hooks";
import { FilesContext } from "./Contexts";
import FilesPreview from "./FilesPreview";

export default function UploadFileButton() {
  // Ref to the <input type="file"> element
  const filesInputElement = useRef<HTMLInputElement>(null);

  // Ref to form submit button
  const submitBtn = useRef<HTMLInputElement>(null);

  // Ref to <form>
  const formElement = useRef<HTMLFormElement>(null);

  const currFolderID = useCurrFolderID();

  const [filesSelected, setFilesSelected] = useState(new Array<File>());

  const { files, setFiles } = useContext(FilesContext) || {
    files: [],
    setFiles: null,
  };

  function handleSelectFiles(_: MouseEvent<HTMLButtonElement>): void {
    filesInputElement.current?.click();
  }

  function handleFilesUploaded(event: ChangeEvent<HTMLInputElement>): void {
    setFilesSelected(Array.from(event.target.files ? event.target.files : []));
  }

  function handleCancel() {
    setFilesSelected([]);
  }

  function handleSubmitFiles(_: MouseEvent<HTMLButtonElement>): void {
    submitBtn.current?.click();
    formElement.current?.reset();
    setFilesSelected([]);
  }

  function handleFilePreviewFileItemDelete(fileIdx: number) {
    setFilesSelected(filesSelected.toSpliced(fileIdx, 1));
  }

  async function handleUpload(fd: FormData) {
    const filesToUpload = fd.getAll("files") as File[];

    const completed = [];

    for (const f of filesToUpload) {
      let err;

      // Get presigned URL
      const urlAndId = await getUploadUrlAndId(currFolderID, f.name, f.type);
      if (urlAndId.err) break;

      // Upload to the presigned URL
      const uploadHeaders = new Headers();
      uploadHeaders.set("Content-Length", f.size.toString());
      await fetch(urlAndId.url, {
        headers: uploadHeaders,
        method: "PUT",
        body: f,
      }).then(async (res) => {
        if (res.status >= 400) {
          const reason = await res.text();
          console.log(
            `UploadFile.handleUpload: Uploading file to presigned URL gave ${res.status}, ${reason}`,
          );
          err = reason;
        }
      });

      if (err) break;

      // Complete upload
      const completeUploadRes = await completeUpload(
        currFolderID,
        urlAndId.fileId,
        f.name,
      );
      if (completeUploadRes.err) break;

      completed.push({
        name: f.name,
        id: urlAndId.fileId,
      });
    }

    if (setFiles)
      setFiles(
        files.concat(
          completed.map((f) => {
            return {
              id: f.id,
              name: f.name,
              isFolder: false,
            };
          }),
        ),
      );
  }

  return (
    <>
      <form ref={formElement} className="hidden" action={handleUpload}>
        <input
          name="files"
          className="hidden"
          type="file"
          multiple
          ref={filesInputElement}
          onChange={handleFilesUploaded}
          data-test="file-upload-input"
        />

        <input ref={submitBtn} type="submit" className="hidden" />
      </form>

      <button
        className="hidden  row-start-2 col-start-10  md:inline py-2 px-3 rounded-md bg-green-600 text-white"
        onClick={handleSelectFiles}
      >
        Upload
      </button>
      <FilesPreview
        files={filesSelected}
        isOpen={filesSelected.length !== 0}
        handleCancel={handleCancel}
        handleSubmitFiles={handleSubmitFiles}
        handleFileItemDelete={handleFilePreviewFileItemDelete}
      />
    </>
  );
}
