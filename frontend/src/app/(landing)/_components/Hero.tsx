import React from "react";
import Link from "next/link";
import Ani from "./Ani";

export default function Hero() {
  return (
    <div className="homeSectionSize h-screen overflow-y-hidden min-h-[550px] flex flex-col items-center lg:flex-row lg:items-center z-[0]">
      {/*--- text ---*/}
      <div className="flex flex-col items-start w-[55%] gap-[20px]">
        <div className="text-[50px] leading-[1.2] font-bold">
          Track expenses with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#63CDF6] to-[#B568FF]">minimal keystrokes</span>
        </div>
        <div className="text-[20px]">Designed for speed and customizability, EZ Budget App is the easiest way to track daily expenses and maintain a budget.</div>
        <Link className="mt-[4px] homeButton" href="/app/items">
          Enter App
        </Link>
      </div>
      {/*--- animation ---*/}
      <div className="w-[45%] flex justify-center">
        <Ani />
      </div>
      {/*--- glow ---*/}
      <div className="absolute w-full h-full left-0 top-0 overflow-hidden z-[-1]">
        <div className="absolute bottom-[0px] translate-y-[50%] left-1/2 -translate-x-1/2 w-[70%] h-[95%] xs:h-[70%] rounded-full bg-[#0444B7] blur-[300px] pointer-events-none"></div>
      </div>
    </div>
  );
}
