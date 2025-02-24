"use client";

import { ReactElement, useContext, MouseEvent } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import { FilesContext, FileItemToDeleteContext } from "./Contexts";
import { MdArrowForward, MdDelete, MdFolder, MdInfo } from "react-icons/md";

import Link from "next/link";
import { cn } from "@/lib/cn";

function FolderList() {
  const { files } = useContext(FilesContext) || {
    files: [],
    setFiles: null,
  };

  return (
    <>
      {files.find((f) => f.isFolder) && (
        <p className="text-md mt-5 mb-3">Folders</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pb-5">
        {files.map((f) => {
          return (
            f.isFolder && <FolderItem name={f.name} id={f.id} key={f.id} />
          );
        })}
      </div>
    </>
  );
}

function FolderItem({
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
        className={cn("h-11 block rounded-xl bg-green-300", className)}
      >
        <Link
          className="h-full flex items-center cursor-pointer"
          href={`/app/${id}`}
          prefetch={false}
          data-test="folder-item"
        >
          <MdFolder className="text-xl inline mx-4" />
          <span className="text-sm">{name}</span>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent className="rounded-xl w-48 [&>*]:flex [&>*]:justify-center [&>*]:items-center [&>*]:py-2 [&>*]:px-2 [&>*]:rounded-md [&>*:hover]:bg-gray-300 [&_svg]:text-lg [&>*]:cursor-pointer">
        <MoveFolderBtn folderId={id}>
          <span>Move</span>
          <ContextMenuShortcut>
            <MdArrowForward />
          </ContextMenuShortcut>
        </MoveFolderBtn>
        <FolderInfoBtn folderId={id}>
          <span>Info</span>
          <ContextMenuShortcut>
            <MdInfo />
          </ContextMenuShortcut>
        </FolderInfoBtn>
        <DeleteFolderBtn
          className="text-red-500"
          folderId={id}
          folderName={name}
        >
          <span>Delete</span>
          <ContextMenuShortcut>
            <MdDelete className="text-red-500" />
          </ContextMenuShortcut>
        </DeleteFolderBtn>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function DeleteFolderBtn({
  children,
  className,
  folderId,
  folderName,
}: {
  children: ReactElement[] | ReactElement;
  className: string;
  folderId: string;
  folderName: string;
}) {
  const { setIsPopoverOpen, setFileItemToDelete } = useContext(
    FileItemToDeleteContext
  ) || {
    setPopoverOpen: null,
    setFileItemToDelete: null,
  };

  function handleClick(_: MouseEvent<HTMLDivElement>): void {
    if (setFileItemToDelete) {
      setFileItemToDelete({ id: folderId, name: folderName });
    }
    if (setIsPopoverOpen) setIsPopoverOpen(true);
  }

  return (
    <ContextMenuItem
      data-test="folder-item-delete-btn"
      onClick={handleClick}
      className={className}
    >
      {children}
    </ContextMenuItem>
  );
}

function MoveFolderBtn({
  folderId,
  children,
}: {
  folderId: string;
  children: ReactElement[] | ReactElement;
}) {
  return <ContextMenuItem>{children}</ContextMenuItem>;
}

function FolderInfoBtn({
  folderId,
  children,
}: {
  folderId: string;
  children: ReactElement[] | ReactElement;
}) {
  return <ContextMenuItem>{children}</ContextMenuItem>;
}

export { FolderList };
