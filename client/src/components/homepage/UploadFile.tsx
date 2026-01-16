"use client";
import { ChangeEvent, MouseEvent, useContext, useRef, useState } from "react";

import { useCurrFolderID, useFileUpload } from "@/helpers/hooks";
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

  const { handleUpload } = useFileUpload();

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

  return (
    <>
      <form
        ref={formElement}
        className="hidden"
        action={async (fd) => {
          const completed = await handleUpload(fd, currFolderID);
          if (setFiles) {
            setFiles([...files, ...completed]);
          }
        }}
      >
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
