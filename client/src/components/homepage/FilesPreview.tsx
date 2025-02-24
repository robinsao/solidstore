import { Popover, PopoverTrigger, PopoverContent } from "../ui/Popover";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { MdClose, MdDelete } from "react-icons/md";
import { ScrollArea } from "../ui/scroll-area";
import { MouseEvent } from "react";

function FilesPreviewFileItem({
  file,
  handleDelete,
}: {
  file: File;
  handleDelete: () => void;
}) {
  return (
    <>
      <TableCell>{file.name}</TableCell>
      <TableCell className="text-right py-2 pr-4">
        <button
          className="p-2 hover:bg-red-500 hover:text-white rounded-md"
          onClick={(_) => handleDelete()}
        >
          <MdDelete />
        </button>
      </TableCell>
    </>
  );
}

function FilesPreview({
  isOpen,
  files,
  handleCancel,
  handleSubmitFiles,
  handleFileItemDelete,
}: {
  isOpen: boolean;
  files: Array<File>;
  handleCancel: () => void;
  handleSubmitFiles: (evt: MouseEvent<HTMLButtonElement>) => void;
  handleFileItemDelete: (fileIdx: number) => void;
}) {
  return (
    <Popover modal={true} open={isOpen}>
      <PopoverTrigger asChild>
        {/* This span element is here to allow us to programmatically open/close the popover. */}
        <span className="hidden"></span>
      </PopoverTrigger>
      <PopoverContent className="top-0 left-0 w-dvw h-dvh transform-none p-0">
        <div className="top-0 left-0 w-dvw h-dvh bg-black opacity-75 fixed"></div>
        <div className="bg-white relative left-[20vw] w-[60vw] top-[20vh] h-[60vh] px-16 py-12 box-border rounded-3xl dark:text-gray-100 dark:bg-gray-800">
          <div className="flex justify-between items-center text-xl">
            <h3>Files Selected</h3>
            <button
              className="px-2 py-2 hover:bg-red-500 hover:text-white rounded-md"
              onClick={handleCancel}
            >
              <MdClose />
            </button>
          </div>
          <ScrollArea className="h-[70%] my-5">
            <Table className="">
              <TableBody>
                {files.map((file, idx) => (
                  <TableRow key={file.name}>
                    <FilesPreviewFileItem
                      file={file}
                      handleDelete={() => handleFileItemDelete(idx)}
                    />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex justify-end gap-8">
            <button
              className="hover:bg-red-500 hover:text-white rounded-md px-5 py-2"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="py-2 px-5 rounded-md bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmitFiles}
              data-test="files-preview-upload-btn"
            >
              Upload
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default FilesPreview;
