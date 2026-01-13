type FetchFolderPathResponse = { id: string; name: string }[];

type CreateFolderResponse = { id: string };

type FetchFilesResponse = {
  files: Array<{ name: string; id: string; isFolder: boolean }>;
};

type UploadUrlAndIdResponse = {
  url: string;
  fileId: string;
};

type DownloadUrlResponse = {
  url: string;
};

export type {
  UploadUrlAndIdResponse,
  DownloadUrlResponse,
  FetchFolderPathResponse,
  CreateFolderResponse,
  FetchFilesResponse,
};
