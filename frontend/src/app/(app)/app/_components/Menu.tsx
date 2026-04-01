"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MenuContainer from "./MenuContainer";
import { FaGear, FaChartSimple, FaList } from "react-icons/fa6";

export default function Menu() {
  const pathname = usePathname();
  const [path, setPath] = useState(pathname); // to create faster feel compared to pathname

  // if menuItems declared outside component, we get hydration warning
  const menuIcon = "text-[1.375rem] portrait:sm:text-[2rem] landscape:lg:text-[2rem]";
  const menuItems = [
    { text: "Items", path: "/app/items", icon: <FaList className={menuIcon} /> },
    { text: "Stats", path: "/app/stats", icon: <FaChartSimple className={menuIcon} /> },
    { text: "Settings", path: "/app/settings", icon: <FaGear className={menuIcon} /> },
  ];

  return (
    <MenuContainer>
      {menuItems.map((i) => (
        <Link
          href={i.path}
          className={`${
            i.path === path ? "" : "text-textTertiary"
          } desktop:hover:text-textPrimary w-20 portrait:sm:w-25 landscape:lg:w-25 rounded-lg flex flex-col items-center justify-center gap-0.5 portrait:sm:gap-1 landscape:lg:gap-1`}
          key={i.text}
          onClick={() => setPath(i.path)}
        >
          {i.icon}
          <p className="text-xs portrait:sm:text-sm landscape:lg:text-sm select-none">{i.text}</p>
        </Link>
      ))}
    </MenuContainer>
  );
}
