"use client";

import { useContext } from "react";
import { FileItemToDeleteContext, FilesContext } from "./Contexts";
import { deleteFileItem } from "@/helpers/server-actions/file";
import { PopoverContent } from "@/components/ui/Popover";
import { useCurrFolderID } from "@/helpers/hooks";

function DeleteFileItemPopoverContent() {
  const { fileItemToDelete } = useContext(FileItemToDeleteContext) || {
    fileItemToDelete: null,
  };
  return (
    <PopoverContent className="top-0 left-0 w-dvw h-dvh transform-none p-0 flex items-center justify-center">
      <div className="top-0 left-0 w-dvw h-dvh bg-black opacity-75 fixed"></div>
      <div className="bg-white relative w-96 h-32 px-8 py-4 box-border rounded-3xl dark:text-gray-100 dark:bg-gray-800">
        <p>
          Are you sure want to delete the file{"/"}folder &quot;
          <span className="underline">{fileItemToDelete?.name}</span>
          &quot;?
        </p>
        <div className="flex gap-5 items-center justify-end mt-4">
          <CancelDeleteFileItemPopoverBtn />
          <DeleteFileItemPopoverBtn />
        </div>
      </div>
    </PopoverContent>
  );
}

function DeleteFileItemPopoverBtn() {
  const { files, setFiles } = useContext(FilesContext) || {
    files: null,
    setFiles: null,
  };
  const { setIsPopoverOpen, setFileItemToDelete, fileItemToDelete } =
    useContext(FileItemToDeleteContext) || {
      setFileItemToDelete: null,
      setIsPopoverOpen: null,
      fileItemToDelete: null,
    };
  const fileId = fileItemToDelete?.id || "";
  const dir = useCurrFolderID();

  return (
    <button
      className="
                py-2
                px-5
                rounded-md
                hover:bg-red-500
                hover:text-white"
      onClick={async function (_) {
        try {
          await deleteFileItem({ fileId: fileId, parentFolderID: dir });

          if (setFileItemToDelete) setFileItemToDelete({ id: "", name: "" });
          if (setIsPopoverOpen) setIsPopoverOpen(false);

          if (setFiles) {
            setFiles(files.filter((f) => f.id !== fileId));
          }
        } catch (e) {
          console.error(e);
        }
      }}
      data-test="file-item-confirm-delete-btn"
    >
      Delete
    </button>
  );
}

function CancelDeleteFileItemPopoverBtn() {
  const { setIsPopoverOpen, setFileItemToDelete } = useContext(
    FileItemToDeleteContext,
  ) || {
    setIsPopoverOpen: undefined,
    setFileItemToDelete: undefined,
  };

  return (
    <button
      className="
                py-2
                px-5
                rounded-md
                hover:bg-gray-400"
      onClick={(_) => {
        if (setFileItemToDelete) setFileItemToDelete({ id: "", name: "" });
        if (setIsPopoverOpen) setIsPopoverOpen(false);
      }}
    >
      Cancel
    </button>
  );
}

export { DeleteFileItemPopoverContent };
