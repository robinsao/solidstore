"use client";
import { FilesContext } from "./Contexts";
import { useContext } from "react";

function FileItemsLoadingContent() {
  return (
    <>
      <p className="text-md mt-5 mb-3">Folders</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pb-5">
        <div
          className={
            "h-11 flex items-center cursor-pointer rounded-xl bg-green-300 animate-pulse"
          }
        ></div>
        <div
          className={
            "h-11 flex items-center cursor-pointer rounded-xl bg-green-300 animate-pulse"
          }
        ></div>
        <div
          className={
            "h-11 flex items-center cursor-pointer rounded-xl bg-green-300 animate-pulse"
          }
        ></div>
        <div
          className={
            "h-11 flex items-center cursor-pointer rounded-xl bg-green-300 animate-pulse"
          }
        ></div>
      </div>

      <p className="text-md mt-5 mb-3">Files</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="h-11 flex items-center rounded-xl bg-gray-300 hover:cursor-pointer animate-pulse"></div>
        <div className="h-11 flex items-center rounded-xl bg-gray-300 hover:cursor-pointer animate-pulse"></div>
        <div className="h-11 flex items-center rounded-xl bg-gray-300 hover:cursor-pointer animate-pulse"></div>
        <div className="h-11 flex items-center rounded-xl bg-gray-300 hover:cursor-pointer animate-pulse"></div>
      </div>
    </>
  );
}

export function FileItemsLoading() {
  const { isFinishFetchFiles } = useContext(FilesContext) || {
    isFinishFetchFiles: false,
  };

  if (isFinishFetchFiles) return <></>;
  return <FileItemsLoadingContent />;
}
