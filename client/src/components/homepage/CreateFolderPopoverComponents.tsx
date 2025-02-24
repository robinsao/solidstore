"use client";

import { ReactElement, useContext } from "react";
import { ContextMenuItem } from "@/components/ui/context-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

import { FilesContext, PageStateContext } from "./Contexts";
import { createFolder } from "@/helpers/server-actions/file";
import { MdFolderOpen } from "react-icons/md";

function CreateNewFolderPopover({
  parentFolderID,
}: {
  parentFolderID: string;
}) {
  const isOpen = useContext(PageStateContext)?.isCreateFolderPopoverOpen;
  return (
    <Popover open={isOpen}>
      <PopoverTrigger asChild>
        <a className="hidden">a</a>
      </PopoverTrigger>
      <PopoverContent className="top-0 left-0 w-dvw h-dvh transform-none p-0 flex items-center justify-center">
        <div className="top-0 left-0 w-dvw h-dvh bg-black opacity-75 fixed"></div>
        <div className="bg-white relative w-96 h-36 px-8 py-4 box-border rounded-3xl dark:text-gray-100 dark:bg-gray-800">
          <p>Enter folder name</p>
          <CreateFolderForm parentFolderID={parentFolderID}>
            <input
              type="text"
              placeholder="Folder name..."
              name="name"
              data-test="new-folder-input"
              className="w-full mt-1 border-2 border-gray-400 rounded-md px-2 py-1"
            />
            <div className="flex justify-end mt-2">
              <CancelCreateFolderButton />
              <input
                type="submit"
                value="Create"
                data-test="new-folder-submit"
                className="py-2 px-5 rounded-md bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              />
            </div>
          </CreateFolderForm>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CancelCreateFolderButton() {
  const setIsPopoverOpen =
    useContext(PageStateContext)?.setIsCreateFolderPopoverOpen;

  return (
    <button
      className="
                py-2
                px-5
                rounded-md
                hover:bg-red-500
                hover:text-white"
      onClick={(_) => {
        if (setIsPopoverOpen) setIsPopoverOpen(false);
      }}
      type="button"
    >
      Cancel
    </button>
  );
}

function CreateFolderForm({
  children,
  parentFolderID,
}: {
  children: ReactElement | ReactElement[];
  parentFolderID: string;
}) {
  const { setIsCreateFolderPopoverOpen } = useContext(PageStateContext) || {
    isCreateFolderPopoverOpen: null,
    setIsCreateFolderPopoverOpen: null,
  };
  const { files, setFiles } = useContext(FilesContext) || {
    files: [],
    setFiles: null,
  };

  return (
    <form
      action={async (d) => {
        // if (isCreateFolderPopoverOpen === false) return;
        d.set("parentFolderID", parentFolderID);
        const { id } = await createFolder(d);
        if (setFiles)
          setFiles(
            files.concat([
              {
                id,
                name: d.get("name") as string,
                isFolder: true,
              },
            ]),
          );
        if (setIsCreateFolderPopoverOpen) setIsCreateFolderPopoverOpen(false);
      }}
    >
      {children}
    </form>
  );
}

function CreateNewFolderBtn() {
  const setIsPopoverOpen =
    useContext(PageStateContext)?.setIsCreateFolderPopoverOpen;
  return (
    <ContextMenuItem
      onClick={() => {
        if (setIsPopoverOpen) setIsPopoverOpen(true);
      }}
      data-test="create-new-folder-btn"
      className="flex justify-between items-center cursor-pointer px-3 py-2 rounded-md"
    >
      <span>New Folder</span>
      <MdFolderOpen />
    </ContextMenuItem>
  );
}

export { CreateNewFolderPopover, CreateNewFolderBtn };
