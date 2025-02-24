"use client";

import { MdSearch } from "react-icons/md";
import clsx from "clsx";
import { searchFiles } from "@/helpers/server-actions/search";

export default function FileSearch({
  formClassNames,
}: {
  formClassNames?: string;
}) {
  return (
    <>
      <p>Search</p>
      <form className={clsx("flex", formClassNames)} action={searchFiles}>
        <input
          type="text"
          placeholder="Search..."
          className="basis-1 grow h-10 px-3 rounded-l-md bg-green-300 text-green-950 focus:border-none
          placeholder:text-green-950"
        />
        <button
          type="submit"
          className="bg-green-600 text-white w-12 h-10 rounded-r-md inline-flex items-center justify-center"
        >
          <MdSearch className="size-6" />
        </button>
      </form>
    </>
  );
}
