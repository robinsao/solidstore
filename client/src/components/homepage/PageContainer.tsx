"use client";

import FileDropZone from "@/components/homepage/FileDropZone";
import { fetchFiles } from "@/helpers/server-actions/file";
import { ReactElement, useState, useEffect } from "react";
import { FilesContext, PageStateContext } from "./Contexts";

export function PageContainer({
  children,
  dir,
}: {
  children: ReactElement | ReactElement[];
  dir: string;
}) {
  const [files, setFiles] = useState(
    new Array<{ name: string; id: string; isFolder: boolean }>(),
  );
  const [isFinishFetchFiles, setIsFinishFetchFiles] = useState(false);
  const [createFolderPopoverOpen, setCreateFolderPopoverOpen] = useState(false);

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
      }}
    >
      <FileDropZone>
        <PageStateContext.Provider
          value={{
            setIsCreateFolderPopoverOpen: setCreateFolderPopoverOpen,
            isCreateFolderPopoverOpen: createFolderPopoverOpen,
          }}
        >
          <div className="h-full">{children}</div>
        </PageStateContext.Provider>
      </FileDropZone>
    </FilesContext.Provider>
  );
}
