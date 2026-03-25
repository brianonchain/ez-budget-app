import React from "react";

export default function ErrorMessage({ position = "left", message }: { position?: "left" | "center"; message: string }) {
  const positions = {
    left: "",
    center: "justify-center",
  };
  return (
    <p className={`min-h-21 desktop:min-h-16 w-full flex items-center font-medium text-textError ${positions[position]}`}>{message}</p>
  );
}
