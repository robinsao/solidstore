"use client";
import {
  DragEvent,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import FilesPreview from "./FilesPreview";
import { useCurrFolderID, useFileUpload } from "@/helpers/hooks";
import { FilesContext } from "./Contexts";

function usePreventDefaultOnWindow(dropZone: RefObject<HTMLElement | null>) {
  // Default browser behavior is to open the file in new tab
  function preventDefaultDropEvt(e: globalThis.DragEvent) {
    if (!e.dataTransfer) return;
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
      e.preventDefault();
    }
  }

  // Default browser behavior prevents dropping
  function preventDefaultDragOverEvt(e: globalThis.DragEvent) {
    if (!e.dataTransfer) return;
    const fileItems = [...e.dataTransfer.items].filter(
      (item) => item.kind === "file"
    );
    if (fileItems.length > 0) {
      e.preventDefault();
      if (dropZone.current && !dropZone.current.contains(e.target as Node)) {
        e.dataTransfer.dropEffect = "none";
      }
    }
  }

  useEffect(
    () => {
      window.addEventListener("drop", preventDefaultDropEvt);
      window.addEventListener("dragover", preventDefaultDragOverEvt);
      return () => {
        window.removeEventListener("drop", preventDefaultDropEvt);
        window.removeEventListener("dragover", preventDefaultDragOverEvt);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

export default function FileDropZone({ children }: { children: ReactNode }) {
  const dropZone = useRef<HTMLDivElement>(null);
  const [isPopoveropen, setIsPopoverOpen] = useState(false);
  const currFolderID = useCurrFolderID();
  const [files, setFiles] = useState<Array<File>>([]);
  const { handleUpload } = useFileUpload();

  const { files: allFiles, setFiles: setAllFiles } = useContext(
    FilesContext
  ) || {
    files: [],
    setFiles: null,
  };

  usePreventDefaultOnWindow(dropZone);
  const dragEnterLeaveCt = useRef<number>(0);

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.stopPropagation();
    event.preventDefault();
    if (
      !event.dataTransfer ||
      !event.dataTransfer.types.find((val) => val === "Files")
    )
      return;

    const uploadedFiles: Array<File> = [];
    for (let i = 0; i < event.dataTransfer.items.length; i++) {
      const f = event.dataTransfer.items[i].getAsFile();
      if (f !== null) uploadedFiles.push(f);
    }
    setFiles(uploadedFiles);
    setIsPopoverOpen(false);
  }

  function handleDragEnter(): void {
    dragEnterLeaveCt.current += 1;
    if (dragEnterLeaveCt.current > 1) return;
    console.log("drag enter");

    setIsPopoverOpen(true);
  }

  function handleDragLeave(): void {
    dragEnterLeaveCt.current -= 1;
    if (dragEnterLeaveCt.current > 0) return;
    console.log("drag leave");

    setIsPopoverOpen(false);
  }
  function handleDragover(event: DragEvent<HTMLDivElement>): void {
    const fileItems = [...event.dataTransfer.items];
    if (fileItems.some((item) => item.kind !== "file")) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsPopoverOpen(true);
  }

  async function handleSubmitFiles() {
    const fd = new FormData();
    files.forEach((file) => {
      fd.append("files", file);
    });
    setFiles([]);
    setIsPopoverOpen(false);

    const completed = await handleUpload(fd, currFolderID);

    if (setAllFiles)
      setAllFiles(
        allFiles.concat(
          completed.map((f) => {
            return { id: f.id, name: f.name, isFolder: false };
          })
        )
      );
  }

  function handleFileItemDelete(idx: number) {
    setFiles(files.toSpliced(idx, 1));
  }

  return (
    <div
      ref={dropZone}
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
          <span suppressHydrationWarning className="hidden"></span>
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
