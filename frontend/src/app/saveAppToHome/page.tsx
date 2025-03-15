"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { BsBoxArrowUp } from "react-icons/bs";

export default function SaveToHome() {
  // states
  const [browser, setBrowser] = useState("");
  const [os, setOs] = useState("");

  useEffect(() => {
    // detect browser
    const userAgent = navigator.userAgent;
    if (userAgent.match(/chrome|chromium|crios/i)) {
      setBrowser("Chrome");
    } else if (userAgent.match(/firefox|fxios/i)) {
      setBrowser("Firefox");
    } else if (userAgent.match(/safari/i)) {
      setBrowser("Safari");
    } else if (userAgent.match(/opr\//i)) {
      setBrowser("Opera");
    } else if (userAgent.match(/edg/i)) {
      setBrowser("Edge");
    } else if (userAgent.match(/samsungbrowser/i)) {
      setBrowser("Samsung");
    } else if (userAgent.match(/ucbrowser/i)) {
      setBrowser("UC");
    } else {
      setBrowser("other");
    }
    // detect os
    if (/Android/i.test(navigator.userAgent)) {
      setOs("android");
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setOs("ios");
    } else {
      setOs("other");
    }
  }, []);

  return (
    <div className="w-full min-h-[100dvh] pt-[30px] pb-[80px] flex flex-col items-center justify-center overflow-y-auto">
      {/*---image---*/}
      <div className="h-[320px] w-[160px] rounded-[16px] shadow-[0px_2px_20px_0px_rgb(0,0,0,0.3)] relative">
        <Image src="/PWA.png" alt="phone showing homescreen" fill />
      </div>

      {/*---text---*/}
      <div className={`${browser && os ? "" : "invisible"} flex flex-col items-center`}>
        <div className="pt-[40px] pb-[30px] font-bold text2XlApp">Add To Home Screen</div>
        <div className="w-[350px] portrait:sm:w-[460px] landscape:lg:w-[460px] flex flex-col gap-[8px] portrait:sm:gap-[16px] landscape:lg:gap-[16px] textBaseApp">
          <p>To use this App, you need to add this website to your home screen.</p>
          <p>
            In the {"ios" ? "bottom menu bar" : "top right corner"} of your browser, tap the share icon{" "}
            <span className="whitespace-nowrap">
              (<BsBoxArrowUp className="inline-block mx-[2px] text-[20px]" />)
            </span>{" "}
            and choose <span className="font-bold">Add to Home Screen</span>. Then, from your home screen, open the saved website.
          </p>
        </div>
      </div>
    </div>
  );
}
