"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { useTheme } from "next-themes";

export default function Profile({ children }: { children: ReactNode }) {
  const [_, setIsOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button data-test="profile" onClick={() => setIsOpen(true)}>
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 bg-background shadow-md
        border-gray-300 border rounded-xl p-0 [&>*]:py-3 [&>*]:px-5"
      >
        <form className="flex justify-between p-2">
          <label htmlFor="dark-mode-toggle">Dark Mode</label>
          <input
            id="dark-mode-toggle"
            type="checkbox"
            onChange={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            checked={resolvedTheme === "dark"}
          />
        </form>
        <Link
          href={"/settings"}
          className="visited:text-black px-2 py-2 hover:bg-foreground/50 block dark:visited:text-white"
        >
          Settings
        </Link>
        <Link
          href={`/api/auth/signout`}
          className="visited:text-red-600 text-red-600 px-2 py-2 hover:bg-red-500 hover:text-white block rounded-b-xl"
          data-test="logout-btn"
        >
          Log out
        </Link>
      </PopoverContent>
    </Popover>
  );
}
