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
    <div className="menuContainer">
      <div className="menuThreeItemContainer">
        {menuItems.map((i) => (
          <div
            className={`${
              i.route === menu ? "text-slate-700" : "text-slate-500"
            } w-[90px] portrait:sm:w-[100px] landscape:lg:w-[100px] flex flex-col items-center justify-center gap-[0px] portrait:sm:gap-[4px] landscape:lg:gap-[4px] cursor-pointer`}
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
