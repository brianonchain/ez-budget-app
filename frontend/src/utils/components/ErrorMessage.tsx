import React from "react";

export default function ErrorMessage({ position = "left", message }: { position?: "left" | "center"; message: string }) {
  const positions = {
    left: "",
    center: "justify-center",
  };
  return <p className={`py-2 min-h-22 desktop:min-h-19 w-full flex font-medium text-textError ${positions[position]}`}>{message}</p>;
}
