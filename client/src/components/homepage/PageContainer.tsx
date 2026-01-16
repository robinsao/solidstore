"use client";

import FileDropZone from "@/components/homepage/FileDropZone";
import { fetchFiles } from "@/helpers/server-actions/file";
import { useState, useEffect, ReactNode } from "react";
import { FilesContext, PageStateContext } from "./Contexts";
import { ProgressFilesToUpload } from "@/helpers/types";
import UploadProgressAlert from "./UploadProgressAlert";
import { FetchFilesResponse } from "@/helpers/server-actions/types";

export function PageContainer({
  children,
  dir,
}: {
  children: ReactNode;
  dir: string;
}) {
  const [files, setFiles] = useState<FetchFilesResponse["files"]>([]);

  const [isFinishFetchFiles, setIsFinishFetchFiles] = useState(false);
  const [createFolderPopoverOpen, setCreateFolderPopoverOpen] = useState(false);
  const [filesUploadProgress, setFilesUploadProgress] =
    useState<ProgressFilesToUpload | null>(null);

  useEffect(() => {
    fetchFiles(dir).then((res) => {
      setFiles(res.files);
      setIsFinishFetchFiles(true);
    });
  }, [dir]);

  return (
    <FilesContext.Provider
      value={{
        files,
        setFiles,
        isFinishFetchFiles,
        setIsFinishFetchFiles,
        filesUploadProgress,
        setFilesUploadProgress,
      }}
    >
      <FileDropZone>
        <PageStateContext.Provider
          value={{
            setIsCreateFolderPopoverOpen: setCreateFolderPopoverOpen,
            isCreateFolderPopoverOpen: createFolderPopoverOpen,
          }}
        >
          <div className="h-full">
            {children}

            <UploadProgressAlert />
          </div>
        </PageStateContext.Provider>
      </FileDropZone>
    </FilesContext.Provider>
  );
}
