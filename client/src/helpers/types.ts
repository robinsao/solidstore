type ProgressFilesToUpload = Record<
  string,
  {
    name: string;
    progress: number;
  }
> | null;

export type { ProgressFilesToUpload };
