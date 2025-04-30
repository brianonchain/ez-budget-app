"use client";
import { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import { useTheme } from "next-themes";

export default function themeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-[72px] h-[40px] bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>; // or a skeleton loader

  const isDark = resolvedTheme === "dark";
  console.log("resolvedTheme", resolvedTheme);

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`w-[72px] h-[40px] bg-gray-300 dark:bg-gray-700 rounded-full p-[3px] flex items-center transition-colors duration-300 relative cursor-pointer`}
    >
      {/* Slider circle */}
      <div
        className={`w-[35px] h-[35px] bg-white dark:bg-darkBg2 rounded-full flex items-center justify-center transition-transform duration-300 transform ${
          isDark ? "translate-x-[32px]" : "translate-x-0"
        }`}
      >
        {isDark ? <FaMoon className="text-slate-200" size={14} /> : <IoSunny className="text-yellow-500" size={20} />}
      </div>
    </button>
  );
}
