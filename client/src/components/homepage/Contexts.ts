import { createContext } from "react";

const FileItemToDeleteContext = createContext<null | {
  fileItemToDelete: { id: string; name: string };
  setFileItemToDelete: ({ id, name }: { id: string; name: string }) => void;
  setIsPopoverOpen: (isOpen: boolean) => void;
}>(null);

const PageStateContext = createContext<null | {
  setIsCreateFolderPopoverOpen: (isOpen: boolean) => void;
  isCreateFolderPopoverOpen: boolean;
}>(null);

const FilesContext = createContext<null | {
  setFiles: (
    files: Array<{
      name: string;
      id: string;
      isFolder: boolean;
    }>,
  ) => void;
  files: Array<{
    name: string;
    id: string;
    isFolder: boolean;
  }>;
  isFinishFetchFiles: boolean;
  setIsFinishFetchFiles: (state: boolean) => void;
}>(null);

export { PageStateContext, FilesContext, FileItemToDeleteContext };
