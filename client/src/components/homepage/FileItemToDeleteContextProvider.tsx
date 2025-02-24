"use client";
import { ReactNode, useState } from "react";
import { FileItemToDeleteContext } from "./Contexts";
import { Popover, PopoverTrigger } from "@/components/ui/Popover";
import { DeleteFileItemPopoverContent } from "./DeleteFileItemPopoverContent";

export function FileItemToDeleteContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [fileItemToDelete, setFileItemToDelete] = useState<{
    id: string;
    name: string;
  }>({ id: "", name: "" });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <FileItemToDeleteContext.Provider
      value={{
        fileItemToDelete,
        setFileItemToDelete,
        setIsPopoverOpen,
      }}
    >
      {children}
      <Popover open={isPopoverOpen}>
        <PopoverTrigger asChild>
          <a className="hidden">a</a>
        </PopoverTrigger>
        <DeleteFileItemPopoverContent />
      </Popover>
    </FileItemToDeleteContext.Provider>
  );
}
