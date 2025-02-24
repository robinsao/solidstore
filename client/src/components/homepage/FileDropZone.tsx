"use client";
import { DragEvent, ReactNode, useContext, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import FilesPreview from "./FilesPreview";
import { useCurrFolderID } from "@/helpers/hooks";
import { FilesContext } from "./Contexts";

import {
  completeUpload,
  getUploadUrlAndId,
} from "@/helpers/server-actions/file";

export default function FileDropZone({ children }: { children: ReactNode }) {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopoveropen, setIsPopoverOpen] = useState(false);
  const currFolderID = useCurrFolderID();
  const [files, setFiles] = useState<Array<File>>([]);

  const { files: allFiles, setFiles: setAllFiles } = useContext(
    FilesContext,
  ) || {
    files: [],
    setFiles: null,
  };

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.stopPropagation();
    event.preventDefault();
    if (
      !event.dataTransfer ||
      !event.dataTransfer.types.find((val) => val === "Files")
    )
      return;

    const uploadedFiles: Array<File> = [];
    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      const f = event.dataTransfer.files.item(i);
      if (f !== null) uploadedFiles.push(f);
    }
    setFiles(uploadedFiles);
    setIsPopoverOpen(false);
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>): void {
    event.stopPropagation();
    event.preventDefault();
    setIsPopoverOpen(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>): void {
    event.stopPropagation();
    event.preventDefault();
    setIsPopoverOpen(false);
  }

  function handleDragover(event: DragEvent<HTMLDivElement>): void {
    event.stopPropagation();
    event.preventDefault();
    setIsPopoverOpen(true);
  }

  async function handleSubmitFiles() {
    const completed = new Array<{ name: string; id: string }>();
    for (const f of files) {
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

      completed.push({ id: urlAndId.fileId, name: f.name });
    }

    setFiles([]);
    setIsPopoverOpen(false);
    if (setAllFiles)
      setAllFiles(
        allFiles.concat(
          completed.map((f) => {
            return { id: f.id, name: f.name, isFolder: false };
          }),
        ),
      );
  }

  function handleFileItemDelete(idx: number) {
    setFiles(files.toSpliced(idx, 1));
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragover}
      className="h-svh"
      data-test="file-drop-zone-wrapper"
    >
      {children}
      <Popover open={isPopoveropen}>
        <PopoverTrigger asChild>
          <button className="hidden">a</button>
        </PopoverTrigger>
        <PopoverContent className="top-0 left-0 w-dvw h-dvh transform-none​ p-0">
          <div className="bg-black opacity-75 w-full h-full fixed"></div>
          <div className="absolute top-[20vh] h-[60vh] left-[20vw] w-[60vw] bg-white  rounded-3xl">
            <div
              className="w-full h-full flex justify-center items-center"
              data-test="file-drop-zone"
            >
              <span className="text-xl">Drop your files</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <FilesPreview
        isOpen={files.length !== 0}
        files={files}
        handleCancel={() => setFiles([])}
        handleSubmitFiles={handleSubmitFiles}
        handleFileItemDelete={handleFileItemDelete}
      />
    </div>
  );
}
