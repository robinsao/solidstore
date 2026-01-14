import Link from "next/link";
import { redirect } from "next/navigation";

import { Suspense } from "react";

import FileSearch from "@/components/SearchFile";
import {
  CreateNewFolderBtn,
  CreateNewFolderPopover,
} from "@/components/homepage/CreateFolderPopoverComponents";
import { FileItemToDeleteContextProvider } from "@/components/homepage/FileItemToDeleteContextProvider";
import { FileItemsLoading } from "@/components/homepage/FileItemsLoading";
import { FileList } from "@/components/homepage/FileList";
import { FolderList } from "@/components/homepage/FolderList";
import { PageContainer } from "@/components/homepage/PageContainer";
import UploadFileButton from "@/components/homepage/UploadFile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { fetchFolderPath } from "@/helpers/server-actions/file";
import { auth } from "@/app/auth";

function StyledBreadcrumb({
  file,
  idx,
}: {
  file: { id: string; name: string };
  idx: number;
}) {
  return (
    <>
      {idx !== 0 && <BreadcrumbSeparator key={`breadcrumb-${file.id}`} />}
      <BreadcrumbItem key={`${file.id}`}>
        <BreadcrumbLink asChild>
          <Link href={`/app/${file.id === "home" ? "" : file.id}`}>
            {file.name}
          </Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
    </>
  );
}

async function Breadcrumbs({ currDirId }: { currDirId: string }) {
  let path = await fetchFolderPath(currDirId);
  path.unshift({ id: "home", name: "Home" });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {path.map((f, idx: number) => (
          <StyledBreadcrumb
            file={f}
            idx={idx}
            key={`breadcrumb-item-${f.id}`}
          />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default async function Page(props: {
  params: Promise<{
    currentDir: string[];
  }>;
}) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const dir = params.currentDir ? params.currentDir[0] : "";

  return (
    <PageContainer dir={dir}>
      {/* Context menu for creating new folder on right click anywhere in page content */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            data-test="right-clickable-area"
            className="px-20 md:px-12 sm:px-4 min-h-[90dvh]"
          >
            {/* Bread crumbs */}
            <Suspense>
              <Breadcrumbs currDirId={dir} />
            </Suspense>

            {/* Search bar and upload files button */}
            <div className="grid grid-cols-10 grid-rows-[auto_1fr]">
              <FileSearch formClassNames="col-span-10 md:col-span-8 row-start-2" />
              <UploadFileButton />
            </div>

            <FileItemToDeleteContextProvider>
              <FileItemsLoading />
              <FolderList />
              <FileList />
            </FileItemToDeleteContextProvider>
          </div>

          {/* Create folder popover */}
          <CreateNewFolderPopover parentFolderID={dir} />
        </ContextMenuTrigger>

        <ContextMenuContent className="w-48">
          <CreateNewFolderBtn />
        </ContextMenuContent>
      </ContextMenu>
    </PageContainer>
  );
}
