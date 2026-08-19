"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MenuContainer from "./MenuContainer";
import { FaGear, FaChartSimple, FaList } from "react-icons/fa6";

export default function Menu() {
  const pathname = usePathname();
  const [path, setPath] = useState(pathname); // to immediately change icon color when clicked

  // must declare menus inside component; or else, we get hydration warning
  const menus = [
    { text: "Items", path: "/app/items", icon: FaList },
    { text: "Stats", path: "/app/stats", icon: FaChartSimple },
    { text: "Settings", path: "/app/settings", icon: FaGear },
  ];

  return (
    <MenuContainer>
      {menus.map((i) => (
        <Link
          href={i.path}
          className={`${
            i.path === path ? "" : "text-textTertiary"
          } hover:text-textPrimary desktop:py-2 w-18 tablet:w-22 desktop:roundedButton flex flex-col items-center justify-center gap-[0.0625rem] tablet:gap-0.5 desktop:gap-1`}
          key={i.text}
          onClick={() => setPath(i.path)}
        >
          <i.icon className="size-[1.5rem] tablet:size-[2.125rem] desktop:size-[1.875rem]" />
          <p className="text-[0.8125rem] tablet:textBase select-none">{i.text}</p>
        </Link>
      ))}
    </MenuContainer>
  );
}
