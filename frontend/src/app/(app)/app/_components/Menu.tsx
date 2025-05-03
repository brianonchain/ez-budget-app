"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaGear, FaChartSimple, FaList } from "react-icons/fa6";

export default function Menu() {
  console.log("Menu.tsx");
  const pathname = usePathname();
  const [menu, setMenu] = useState(pathname); // to create faster feel compared to pathname

  // if menuItems declared outside component, we get hydration warning
  const menuItems = [
    { text: "Items", route: "/app/items", icon: <FaList className="menuIcon" /> },
    { text: "Stats", route: "/app/stats", icon: <FaChartSimple className="menuIcon" /> },
    { text: "Settings", route: "/app/settings", icon: <FaGear className="menuIcon" /> },
  ];

  return (
    <div className="menuSize landscape:bg-gradient-to-r portrait:bg-gradient-to-t from-lightBg1 to-lightBg1 dark:from-[#03082E] dark:to-blue-500/18 shadow-[6px_0px_10px_0px_rgba(0,0,0,0.02)]">
      <div className="landscape:w-full landscape:h-[80%] landscape:min-h-[360px] landscape:max-h-[600px] portrait:w-full portrait:min-w-[360px] portrait:max-w-[700px] portrait:pb-[10px] flex landscape:flex-col items-center justify-around">
        {menuItems.map((i) => (
          <Link
            href={i.route}
            className={`${
              i.route === menu ? "text-slate-800 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"
            } desktop:hover:text-slate-800 dark:desktop:hover:text-slate-300 w-[90px] portrait:sm:w-[100px] landscape:lg:w-[100px] flex flex-col items-center justify-center gap-[0px] portrait:sm:gap-[4px] landscape:lg:gap-[4px] cursor-pointer`}
            key={i.text}
            onClick={() => setMenu(i.route)}
          >
            {i.icon}
            <p className="text-base">{i.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
