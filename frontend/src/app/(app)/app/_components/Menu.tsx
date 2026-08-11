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
          } desktop:hover:text-textPrimary w-20 tablet:w-25 roundedButton flex flex-col items-center justify-center gap-0.5 tablet:gap-1`}
          key={i.text}
          onClick={() => setPath(i.path)}
        >
          <i.icon className="text-[1.375rem] tablet:text-[2rem]" />
          <p className="text-xs tablet:text-sm select-none">{i.text}</p>
        </Link>
      ))}
    </MenuContainer>
  );
}
