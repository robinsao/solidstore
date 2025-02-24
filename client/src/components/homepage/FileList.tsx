"use client";

import { MouseEvent, ReactElement, useContext } from "react";
import {
  MdArrowForward,
  MdAttachFile,
  MdDelete,
  MdDownload,
  MdInfo,
} from "react-icons/md";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FileItemToDeleteContext, FilesContext } from "./Contexts";

import { getDownloadUrl } from "@/helpers/server-actions/file";

import { cn } from "@/lib/cn";

function FileList() {
  const { files } = useContext(FilesContext) || {
    files: [],
    setFiles: null,
  };
  return (
    <>
      {files.find((f) => !f.isFolder) && (
        <p className="text-md mt-5 mb-3">Files</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {files.map((f) => {
          return !f.isFolder && <FileItem name={f.name} id={f.id} key={f.id} />;
        })}
      </div>
    </>
  );
}

function FileItem({
  name,
  id,
  className,
}: {
  name: string;
  id: string;
  className?: string;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={cn(
          "h-11 block rounded-xl bg-gray-300 hover:cursor-pointer",
          className,
        )}
      >
        <div data-test="file-item" className="h-full flex items-center">
          <MdAttachFile className="text-xl inline mx-4" />
          <span className="text-sm">{name}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="rounded-xl w-48 [&>*]:flex [&>*]:justify-center [&>*]:items-center [&>*]:py-2 [&>*]:px-2 [&>*]:rounded-md [&>*:hover]:bg-gray-300 [&_svg]:text-lg [&>*]:cursor-pointer">
        <DownloadFileBtn fileId={id} fileName={name}>
          <span>Download</span>
          <ContextMenuShortcut>
            <MdDownload />
          </ContextMenuShortcut>
        </DownloadFileBtn>
        <MoveFileBtn fileId={id}>
          <span>Move</span>
          <ContextMenuShortcut>
            <MdArrowForward />
          </ContextMenuShortcut>
        </MoveFileBtn>
        <FileInfoBtn fileId={id}>
          <span>Info</span>
          <ContextMenuShortcut>
            <MdInfo />
          </ContextMenuShortcut>
        </FileInfoBtn>
        <DeleteFileBtn className="text-red-500" fileId={id} fileName={name}>
          <span>Delete</span>
          <ContextMenuShortcut>
            <MdDelete className="text-red-500" />
          </ContextMenuShortcut>
        </DeleteFileBtn>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DownloadFileBtn({
  children,
  fileId,
  fileName,
}: {
  children: ReactElement[] | ReactElement;
  fileId: string;
  fileName: string;
}) {
  async function handleDownload(e: MouseEvent) {
    const res = await getDownloadUrl(fileId);
    if (!res || res.err) return;

    const blob = await fetch(res.url, {
      headers: {},
    }).then((res) => res.blob());

    const downloadAnchor = document.createElement("a");

    const url = URL.createObjectURL(blob);
    downloadAnchor.href = url;
    downloadAnchor.download = fileName;
    e.stopPropagation();

    downloadAnchor.click();
    URL.revokeObjectURL(url);
    downloadAnchor.href = "";
    downloadAnchor.download = "";

    downloadAnchor.remove();
  }

  return (
    <ContextMenuItem
      onClick={handleDownload}
      className="flex w-full h-full items-center justify-between"
    >
      {children}
    </ContextMenuItem>
  );
}

function MoveFileBtn({
  fileId,
  children,
}: {
  fileId: string;
  children: ReactElement[] | ReactElement;
}) {
  return <ContextMenuItem>{children}</ContextMenuItem>;
}

function FileInfoBtn({
  fileId,
  children,
}: {
  fileId: string;
  children: ReactElement[] | ReactElement;
}) {
  return <ContextMenuItem>{children}</ContextMenuItem>;
}

function DeleteFileBtn({
  children,
  className,
  fileId,
  fileName,
}: {
  children: ReactElement[] | ReactElement;
  className: string;
  fileId: string;
  fileName: string;
}) {
  const { setIsPopoverOpen, setFileItemToDelete } = useContext(
    FileItemToDeleteContext,
  ) || {
    setPopoverOpen: null,
    setFileItemToDelete: null,
  };

  function handleClick(_: MouseEvent<HTMLDivElement>): void {
    if (setFileItemToDelete) {
      setFileItemToDelete({ id: fileId, name: fileName });
    }
    if (setIsPopoverOpen) setIsPopoverOpen(true);
  }

  return (
    <ContextMenuItem
      data-test="file-item-delete-btn"
      onClick={handleClick}
      className={className}
    >
      {children}
    </ContextMenuItem>
  );
}

export { FileList };
