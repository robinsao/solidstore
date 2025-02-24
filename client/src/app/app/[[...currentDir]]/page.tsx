import Link from "next/link";
import { redirect } from "next/navigation";

import { Suspense } from "react";

import { getSession } from "@auth0/nextjs-auth0";

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
import { fetchWithAuthFromServer } from "@/helpers/backend-helpers";

async function fetchFolderPath(folderId: string) {
  "use server";

  if (!folderId) return [];
  const path = await fetchWithAuthFromServer(
    `${process.env.BACKEND_PB_DOMAIN_NAME}/folders/${folderId}/path`,
    { method: "GET" },
  )
    .then((res) => res.json())
    .catch((err) => {
      console.log(`Error fetching breadcrumbs: ${err}`);
    });

  return path?.path;
}

async function Breadcrumbs({ currDirId }: { currDirId: string }) {
  const path: Array<{ id: string; name: string }> =
    await fetchFolderPath(currDirId);
  path.unshift({ id: "home", name: "Home" });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {path.map((f, idx: number) => (
          <>
            {idx !== 0 && <BreadcrumbSeparator key={`breadcrumb-${f.id}`} />}
            <BreadcrumbItem key={`${f.id}`}>
              <BreadcrumbLink asChild>
                <Link href={`/app/${f.id === "home" ? "" : f.id}`}>
                  {f.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default async function Page({
  params,
}: {
  params: {
    currentDir: string[];
  };
}) {
  const session = await getSession();
  if (
    !session ||
    !session.accessTokenExpiresAt ||
    Date.now() / 1000 - session.accessTokenExpiresAt > 0
  )
    redirect("/api/auth/login");

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
