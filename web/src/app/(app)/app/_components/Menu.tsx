"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaGear, FaChartSimple, FaList } from "react-icons/fa6";

const menuSize = "w-(--menuWidth) h-(--menuHeight) landscape:h-screen portrait:w-screen";
const menuBg =
  "bg-card dark:bg-background dark:portrait:bg-gradient-to-b dark:landscape:bg-gradient-to-l dark:from-card dark:to-transparent dark:to-60%";
const menuShadow = "shadow-[0px_0px_16px_0px_rgba(0,0,0,0.1)] dark:shadow-none";

export default function Menu() {
  const pathname = usePathname();
  const [path, setPath] = useState(pathname); // to immediately change icon color when clicked

  // declare this inside component, else get hydration warning
  const TABS = [
    { text: "Items", path: "/app/items", icon: FaList },
    { text: "Stats", path: "/app/stats", icon: FaChartSimple },
    { text: "Settings", path: "/app/settings", icon: FaGear },
  ];

  return (
    <div
      className={`fixed z-20 portrait:bottom-0 landscape:left-0 portrait:px-[3%] tablet:portrait:px-[5%] portrait:pb-[24px] tablet:landscape:py-[3%] flex portrait:items-end landscape:items-center justify-center ${menuSize} ${menuBg} ${menuShadow}`}
    >
      <div
        className={`landscape:w-full landscape:h-full landscape:max-h-190 portrait:w-full portrait:max-w-220 flex landscape:flex-col items-center justify-evenly`}
      >
        {TABS.map((i) => (
          <Link
            href={i.path}
            className={`${
              i.path === path ? "" : "text-muted-foreground"
            } hover:text-foreground desktop:py-2 w-18 tablet:w-22 desktop:roundedButton flex flex-col items-center justify-center gap-[0.0625rem] tablet:gap-0.5 desktop:gap-1`}
            key={i.text}
            onClick={() => setPath(i.path)}
          >
            <i.icon className="size-[1.5rem] tablet:size-[2.125rem] desktop:size-[1.875rem]" />
            <p className="text-[0.8125rem] tablet:textBase select-none">{i.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
