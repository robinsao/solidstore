import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/Collapsible";
import { FaChevronDown, FaFile } from "react-icons/fa";
import { Progress } from "../ui/Progress";
import { useContext, useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { FilesContext } from "./Contexts";

const MAX_LEN_DISPLAYED_FILENAME = 20;

function ProgressEntry({
  fileName,
  progress,
}: {
  fileName: string;
  progress: number;
}) {
  if (fileName.length > MAX_LEN_DISPLAYED_FILENAME)
    fileName = fileName.slice(0, MAX_LEN_DISPLAYED_FILENAME + 1) + "...";
  progress = Math.round(progress);
  return (
    <div className="flex items-center gap-4 p-4 border-gray-400 dark:border-gray-500">
      <span className="text-left w-full">
        <FaFile className="size-5 mr-4 inline" />
        <span className="text-left max-w-60 font-medium">{fileName}</span>
      </span>
      <div className="flex items-center gap-4">
        <Progress
          className="w-56 h-1 bg-gray-300 dark:bg-gray-500 *:bg-green-500"
          value={progress}
        />
        <p className="w-12">{progress}%</p>
      </div>
    </div>
  );
}

export default function UploadProgressAlert() {
  "use client";
  const { filesUploadProgress: filesProgress } = useContext(FilesContext) || {
    filesUploadProgress: null,
  };
  const [localFilesProgress, setLocalFilesProgress] = useState(filesProgress);
  useEffect(() => {
    if (filesProgress && Object.keys(filesProgress).length > 0)
      // eslint-disable-next-line
      setLocalFilesProgress(filesProgress);
  }, [filesProgress]);
  const isCompleted = Object.values(localFilesProgress || {}).every(
    (file) => file.progress >= 100
  );

  if (
    localFilesProgress == null ||
    Object.keys(localFilesProgress).length === 0
  )
    return <></>;
  const fileIds = Object.keys(localFilesProgress);
  let header = fileIds.length === 1 ? "1 file" : `${fileIds.length} files`;
  header += isCompleted ? " upload completed" : " upload in progress";

  return (
    <Collapsible
      defaultOpen={true}
      className="fixed bottom-8 right-8 w-auto dark:text-foreground dark:border-none dark:shadow-black shadow-2xl rounded-2xl overflow-hidden"
    >
      <div className="bg-green-700 dark:bg-green-600 text-white rounded-t-2xl flex items-center gap-2 p-4">
        <h3 className="w-full">{header}</h3>
        <CollapsibleTrigger asChild>
          <button>
            <FaChevronDown className="size-4" />
            <span className="sr-only">Toggle</span>
          </button>
        </CollapsibleTrigger>
        <button onClick={() => setLocalFilesProgress(null)}>
          <MdClose className="size-4" />
          <span className="sr-only">Toggle</span>
        </button>
      </div>
      <CollapsibleContent className="max-h-80 overflow-y-scroll">
        {fileIds.map((fileId) => (
          <ProgressEntry
            key={fileId}
            fileName={localFilesProgress[fileId].name}
            progress={localFilesProgress[fileId].progress}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
