"use client";
import ThemeToggle from "@/utils/components/ThemeToggle";

export default function LoginThemeToggle() {
  return (
    <div className="absolute top-[12px] right-[12px] xs:top-[24px] xs:right-[32px]">
      <ThemeToggle />
    </div>
  );
}
