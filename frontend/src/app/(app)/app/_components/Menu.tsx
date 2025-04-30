"use client";
import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaGear, FaChartSimple, FaList } from "react-icons/fa6";

export default function Navbar({}: {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menu, setMenu] = useState(pathname); // to create faster feel compared to pathname

  // if menuItems declared as const outside component, we get hydration mismatch warning. So, menuItems is instantiated inside component
  const menuItems = useMemo(
    () => [
      { text: "Items", route: "/app/items", icon: <FaList className="menuIcon" /> },
      { text: "Stats", route: "/app/stats", icon: <FaChartSimple className="menuIcon" /> },
      { text: "Settings", route: "/app/settings", icon: <FaGear className="menuIcon" /> },
    ],
    []
  );

  return (
    <div className="menuContainer landscape:bg-gradient-to-r portrait:bg-gradient-to-t from-lightBg1 to-lightBg1 dark:from-[#03082E] dark:to-blue-500/18">
      <div className="menuThreeItemContainer">
        {menuItems.map((i) => (
          <div
            className={`${
              i.route === menu ? "text-slate-800 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"
            } desktop:hover:text-slate-800 dark:desktop:hover:text-slate-300 w-[90px] portrait:sm:w-[100px] landscape:lg:w-[100px] flex flex-col items-center justify-center gap-[0px] portrait:sm:gap-[4px] landscape:lg:gap-[4px] cursor-pointer`}
            key={i.text}
            onClick={() => {
              setMenu(i.route);
              router.push(i.route);
            }}
          >
            {i.icon}
            <p className="menuText">{i.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
