"use client";

import { ReactElement } from "react";

export default function FileDropWrapper({
  children,
}: {
  children: ReactElement | ReactElement[];
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
