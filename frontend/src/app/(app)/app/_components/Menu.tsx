"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaGear, FaChartSimple, FaList } from "react-icons/fa6";

export default function Menu() {
  const pathname = usePathname();
  const [path, setPath] = useState(pathname); // to create faster feel compared to pathname

  // if menuItems declared outside component, we get hydration warning
  const menuItems = [
    { text: "Items", path: "/app/items", icon: <FaList className="menuIcon" /> },
    { text: "Stats", path: "/app/stats", icon: <FaChartSimple className="menuIcon" /> },
    { text: "Settings", path: "/app/settings", icon: <FaGear className="menuIcon" /> },
  ];

  return (
    <div className="fixed z-20 portrait:bottom-0 landscape:left-0 flex portrait:items-end landscape:items-center justify-center menuSize menuBg menuShadow">
      <div className="landscape:w-full landscape:h-[80%] landscape:max-h-100 portrait:w-[80%] portrait:max-w-140 menuPbSafeArea flex landscape:flex-col items-center justify-between">
        {menuItems.map((i) => (
          <Link
            href={i.path}
            className={`${
              i.path === path ? "text-textPrimary" : "text-textTertiary"
            } desktop:hover:text-textPrimary w-20 portrait:sm:w-25 landscape:lg:w-25 flex flex-col items-center justify-center gap-0.5 portrait:sm:gap-1 landscape:lg:gap-1 cursor-pointer`}
            key={i.text}
            onClick={() => setPath(i.path)}
          >
            {i.icon}
            <p className="text-xs portrait:sm:text-sm landscape:lg:text-sm">{i.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
