"use client";

import { ReactElement } from "react";

export default function FileDropWrapper({
  children,
}: {
  children: ReactElement<any> | ReactElement<any>[];
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
