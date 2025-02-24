import { usePathname } from "next/navigation";

/**
 * This hook reads the URL to determine the directory that the user is currently viewing
 *
 * @returns The folder ID of the directory that the user is viewing
 */
function useCurrFolderID() {
  const pathname = usePathname();
  if (!pathname.endsWith("app")) return pathname.split("/").at(-1) || "";
  return "";
}

export { useCurrFolderID };
