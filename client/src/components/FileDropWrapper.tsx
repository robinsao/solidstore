"use client";

import { ReactNode } from "react";

export default function FileDropWrapper({
  children,
}: {
  children: ReactNode[];
}) {
  return (
    <div
      onDrop={(evt) => {
        evt.preventDefault();
      }}
    >
      {children}
    </div>
  );
}
