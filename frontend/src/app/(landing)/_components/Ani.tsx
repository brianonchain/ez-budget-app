import { FaGear, FaChartSimple, FaList } from "react-icons/fa6";
import { Item } from "@/db/UserModel";
import { FaPlus } from "react-icons/fa";
import Image from "next/image";
import { FaDeleteLeft } from "react-icons/fa6";
import { TbPointer } from "react-icons/tb";
import { FaRegHandPointer } from "react-icons/fa6";
import { LuMousePointer2 } from "react-icons/lu";
import { Roboto_Mono } from "next/font/google";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const calc = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"];

const labelOptions = {
  category: ["None", "Food & Drinks", "Rent", "Utilities", "Entertainment", "Transportation", "Insurance"],
  subcategory: ["None", "Restaurants", "Groceries", "Coffee", "Snacks"],
  tag: ["None", "Europe Trip 2025", "Ava's 21st Birthday"],
};

export default function Ani() {
  const menuItems = [
    { text: "Items", route: "/app/items", icon: <FaList className="text-[24px]" /> },
    { text: "Stats", route: "/app/stats", icon: <FaChartSimple className="text-[24px]" /> },
    { text: "Settings", route: "/app/settings", icon: <FaGear className="text-[24px]" /> },
  ];

  const menu = "/app/items";

  const data = [
    {
      date: new Date("2025-03-11T11:45:19.862Z"),
      cost: 18.12,
      description: "pizza",
      category: "food",
      subcategory: "restaurant",
      tags: "none",
    },
    {
      date: "2025-03-11T11:55:44.660Z",
      cost: 70.85,
      description: "Jan phone bill",
      category: "utilities",
      subcategory: "phone",
      tags: "none",
    },
    {
      date: "2025-03-11T11:59:29.766Z",
      cost: 50.98,
      description: "gas",
      category: "transportation",
      subcategory: "gas",
      tags: "none",
    },
    {
      date: "2025-03-11T11:59:58.221Z",
      cost: 11.72,
      description: "movie",
      category: "entertainment",
      subcategory: "none",
      tags: "none",
    },
    {
      date: "2025-03-11T12:04:30.194Z",
      cost: 5.8,
      description: "Peet's latte",
      category: "food",
      subcategory: "coffee",
      tags: "none",
    },
    {
      date: "2025-03-11T12:20:31.796Z",
      cost: 48.05,
      description: "Gap sweater",
      category: "shopping",
      subcategory: "clothes",
      tags: "none",
    },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="w-[390px] h-[844px] scale-[65%]">
        {/*--- phone outline ---*/}
        <div className="absolute left-[-155px] top-[-140px] w-[700px] h-[1092px]">
          <Image src="/phone.png" alt="phone" fill priority />
        </div>
        {/*--- animated arrow ---*/}
        <div className="animate-arrow absolute left-1/2 -x-translate-1/2 z-20 top-[455px] pointer-events-none">
          <LuMousePointer2 className="text-[40px]" style={{ filter: "drop-shadow(0 0 10px #facc15)" }} />
        </div>
        {/*--- Pages Container ---*/}
        <div className="flex-none w-full h-[calc(100%-80px)] mb-[80px] flex flex-col items-center overflow-hidden overflow-y-auto text-base bg-darkBg1 relative z-0">
          {/*--- glow ---*/}
          <div className="absolute w-full h-full left-0 top-0 overflow-hidden z-[-1]">
            <div className="absolute top-1/2 right-0 translate-y-[-50%] translate-x-[50%] w-[90%] h-[50%] rounded-full bg-[#0444B7] blur-[200px] pointer-events-none"></div>
          </div>
          {/*--- Page 1 ---*/}
          <div className="absolute left-0 top-0 w-full h-full animate-page1">
            <div className="w-full bg-blue-400/6 border-white/10 overflow-hidden">
              {/*--- header, h=50px, use 2 divs to make scrollbar space aligned with list ---*/}
              <div className="text-slate-400 bg-blue-400/14 thinScrollbar overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
                <div className="px-[3%] h-[50px] grid grid-cols-[50%_20%_30%] items-center font-bold">
                  <p>Item</p>
                  <p>Cost</p>
                  <p className="justify-self-end">Category</p>
                </div>
              </div>
              {/*--- items ---*/}
              <div
                className="w-full h-[calc(844px-80px-80px-50px)] text-base overscroll-none overflow-y-auto overflow-x-hidden select-none relative"
                style={{ scrollbarGutter: "stable" }}
              >
                {data.map((item: Item, index: number) => (
                  <div
                    key={index}
                    className="px-[3%] w-full h-[calc((844px-80px-80px-50px)/10)] grid grid-cols-[50%_20%_30%] items-center border-b-[1.5px] border-white/5 cursor-pointer desktop:hover:bg-blue-500/10"
                  >
                    <div className="">{item.description}</div>
                    <div className="">{item.cost}</div>
                    <div className="flex flex-col justify-self-end text-end">
                      {item.category !== "none" && <p className="font-medium leading-tight">{item.category}</p>}
                      {item.subcategory !== "none" && <p className="italic text-sm leading-tight text-slate-400">{item.subcategory}</p>}
                      {item.tags !== "none" && <div className="text-sm leading-tight text-darkButton1Bg truncate">{item.tags}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/*--- add item h-80px/110px ---*/}
            <div className="flex-none w-full h-[80px] flex items-center justify-center">
              <div className="animate-button1 button1ColorDark w-[200px] h-[60px] rounded-full flex items-center gap-[8px] justify-center desktop:cursor-pointer">
                <FaPlus className="text-[20px]" />
                <p className="text-lg font-semibold">Item</p>
              </div>
            </div>
          </div>

          {/*--- Page 2 ---*/}
          <div className="absolute left-0 top-0 w-full h-full flex flex-col items-center animate-page2">
            {/*--- header ---*/}
            <div className="pageHeader">
              Enter Cost
              <div className="absolute right-[-8px] top-[4px] w-[60px] h-[60px] text-[32px] font-bold flex items-center justify-center rounded-[8px] cursor-pointer hover:bg-darkBg3 active:bg-darkBg3">
                &#10005;
              </div>
            </div>
            {/*--- content ---*/}
            <div className="flex-none w-[294px] flex flex-col items-center overflow-hidden">
              {/*--- amount ---*/}
              <div className={`w-full py-[30px] text-5xl text-right font-bold animate-cost ${robotoMono.className}`}>6.80</div>
              {/*--- keypad ---*/}
              <div className="grid grid-cols-3 gap-[12px]">
                {calc.map((i, index) => (
                  <div
                    key={index}
                    className="w-[90px] h-[72px] flex items-center justify-center text-xl font-medium bg-blue-500/30 hover:bg-blue-500/40 rounded-[16px] cursor-pointer"
                  >
                    {i}
                  </div>
                ))}
                <div className="w-[90px] h-[72px] flex items-center justify-center text-xl font-medium bg-blue-500/30 hover:bg-blue-500/40 rounded-[16px] cursor-pointer">
                  <FaDeleteLeft />
                </div>
              </div>
              {/*--- button ---*/}
              <button className="animate-button2 mt-[30px] w-full h-[52px] button1ColorDark rounded-[12px] text-xl font-medium cursor-pointer">Enter</button>
            </div>
          </div>

          {/*--- Page 3 ---*/}
          <div className="absolute left-0 top-0 w-full h-full flex flex-col items-center animate-page3">
            {/*--- header ---*/}
            <div className="pageHeader">
              Enter Name
              <div className="absolute right-[-8px] top-[4px] w-[60px] h-[60px] text-[32px] font-bold flex items-center justify-center rounded-[8px] cursor-pointer hover:bg-darkBg3 active:bg-darkBg3">
                &#10005;
              </div>
            </div>
            {/*--- content ---*/}
            <div className="pt-[80px] flex-none w-[350px] h-[500px]">
              <div className="w-full relative">
                <textarea className="p-[16px] w-full h-[200px] text-2xl border rounded-[16px] border-slate-400" disabled />
                <div className={`absolute top-[16px] left-[16px] text-[30px] animate-name ${robotoMono.className}`}>Starbucks latte</div>
              </div>
              <button className="animate-button3 mt-[30px] w-full h-[52px] button1ColorDark rounded-[12px] text-xl font-medium cursor-pointer">Enter</button>
            </div>
          </div>

          {/*--- Page 4 ---*/}
          <div className="absolute left-0 top-0 w-full h-full flex flex-col items-center animate-page4">
            <div className="pageHeader">
              Enter Category <br />& Subcategory
              <div className="absolute right-[-8px] top-[4px] w-[60px] h-[60px] text-[32px] font-bold flex items-center justify-center rounded-[8px] cursor-pointer hover:bg-darkBg3 active:bg-darkBg3">
                &#10005;
              </div>
            </div>
            {/*--- label type ---*/}
            <div className="w-[360px] grid grid-cols-3 gap-[4px]">
              {/*--- Category ---*/}
              <div
                className={`animate-labelTypeBg1 text-white p-[8px] h-[64px] flex flex-col items-center border-2 border-darkButton1Bg rounded-[8px] relative desktop:cursor-pointer desktop:hover:bg-darkButton1Bg desktop:hover:text-white`}
              >
                <p className="text-base font-medium tracking-tighter text-center">Category</p>
                <div className="w-full  flex justify-center relative">
                  <div className="absolute text-sm text-center tracking-tighter animate-none1">none</div>
                  <div className="absolute text-sm text-center tracking-tighter animate-labelText1">Food</div>
                </div>
                <div className={`animate-labelTypeArrow1 absolute top-[calc(100%+12px)] left-[36px] w-[40px] h-[40px] rotate-45 bg-darkBg3`}></div>
              </div>
              {/*--- Subcategory ---*/}
              <div
                className={`animate-labelTypeBg2 text-white p-[8px] h-[64px] flex flex-col items-center border-2 border-darkButton1Bg rounded-[8px] relative desktop:cursor-pointer desktop:hover:bg-darkButton1Bg desktop:hover:text-white`}
              >
                <p className="text-base font-medium tracking-tighter text-center">Subcategory</p>
                <div className="w-full text-sm text-center tracking-tighter flex justify-center relative">
                  <div className="absolute animate-none2">none</div>
                  <div className="absolute animate-labelText2">Coffee</div>
                </div>
                <div className={`animate-labelTypeArrow2 absolute top-[calc(100%+12px)] left-[36px] w-[40px] h-[40px] rotate-45 bg-darkBg3`}></div>
              </div>
              {/*--- Tags ---*/}
              <div
                className={`animate-labelTypeBg3 text-white p-[8px] h-[64px] flex flex-col items-center border-2 border-darkButton1Bg rounded-[8px] relative desktop:cursor-pointer desktop:hover:bg-darkButton1Bg desktop:hover:text-white`}
              >
                <p className="text-base font-medium tracking-tighter text-center">Tags</p>
                <div className="w-full text-sm text-center tracking-tighter flex justify-center relative">none</div>
                <div className={`animate-labelTypeArrow3 absolute top-[calc(100%+12px)] left-[36px] w-[40px] h-[40px] rotate-45 bg-darkBg3`}></div>
              </div>
            </div>
            {/*--- label choices ---*/}
            <div className="grow mt-[20px] py-[20px] w-[360px] flex justify-center overflow-hidden bg-darkBg3 rounded-[12px] relative">
              {/*--- category choices ---*/}
              <div className="absolute w-full px-[20px] h-full flex flex-col gap-[4px] animate-choices1">
                {labelOptions["category"].map((i, index) => (
                  <div
                    key={index}
                    className={`${
                      i === "None" ? "border-darkButton1Bg" : "border-transparent"
                    } flex-none px-[12px] w-full h-[56px] flex items-center justify-between font-medium border-2 rounded-[8px] cursor-pointer bg-blue-100/10 hover:border-darkButton1Bg`}
                  >
                    <p>{i.charAt(0).toUpperCase() + i.slice(1)}</p>
                  </div>
                ))}
              </div>
              {/*--- subcategory choices ---*/}
              <div className="absolute w-full px-[20px] h-full flex flex-col gap-[4px] animate-choices2">
                {labelOptions["subcategory"].map((i, index) => (
                  <div
                    key={index}
                    className={`${
                      i === "None" ? "border-darkButton1Bg" : "border-transparent"
                    } flex-none px-[12px] w-full h-[56px] flex items-center justify-between font-medium border-2 rounded-[8px] cursor-pointer bg-blue-100/10 hover:border-darkButton1Bg`}
                  >
                    <p>{i.charAt(0).toUpperCase() + i.slice(1)}</p>
                  </div>
                ))}
              </div>
              {/*--- tag choices ---*/}
              <div className="absolute w-full px-[20px] h-full flex flex-col gap-[4px] animate-choices3">
                {labelOptions["tag"].map((i, index) => (
                  <div
                    key={index}
                    className={`${
                      i === "None" ? "border-darkButton1Bg" : "border-transparent"
                    } flex-none px-[12px] w-full h-[56px] flex items-center justify-between font-medium border-2 rounded-[8px] cursor-pointer bg-blue-100/10 hover:border-darkButton1Bg`}
                  >
                    <p>{i.charAt(0).toUpperCase() + i.slice(1)}</p>
                  </div>
                ))}
              </div>
            </div>
            {/*--- button ---*/}
            <div className="flex-none pb-[40px]">
              <button className="animate-button4 mt-[30px] w-[360px] h-[52px] button1ColorDark rounded-[12px] text-xl font-medium cursor-pointer">Done</button>
            </div>
          </div>

          {/*--- Page 5 ---*/}
          <div className="absolute left-0 top-0 w-full h-full animate-page5">
            <div className="w-full bg-blue-400/6 border-white/10 overflow-hidden">
              {/*--- header, h=50px, use 2 divs to make scrollbar space aligned with list ---*/}
              <div className="text-slate-400 bg-blue-400/14 thinScrollbar overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
                <div className="px-[3%] h-[50px] grid grid-cols-[50%_20%_30%] items-center font-bold">
                  <p>Item</p>
                  <p>Cost</p>
                  <p className="justify-self-end">Category</p>
                </div>
              </div>
              {/*--- items ---*/}
              <div
                className="w-full h-[calc(844px-80px-80px-50px)] text-base overscroll-none overflow-y-auto overflow-x-hidden select-none relative"
                style={{ scrollbarGutter: "stable" }}
              >
                {[
                  {
                    date: new Date("2025-03-12T11:45:19.862Z"),
                    cost: 6.8,
                    description: "Starbucks latte",
                    category: "food",
                    subcategory: "coffee",
                    tags: "none",
                  },
                  ...data,
                ].map((item: Item, index: number) => (
                  <div
                    key={index}
                    className="px-[3%] w-full h-[calc((844px-80px-80px-50px)/10)] grid grid-cols-[50%_20%_30%] items-center border-b-[1.5px] border-white/5 cursor-pointer desktop:hover:bg-blue-500/10"
                  >
                    <div className="">{item.description}</div>
                    <div className="">{item.cost}</div>
                    <div className="flex flex-col justify-self-end text-end">
                      {item.category !== "none" && <p className="font-medium leading-tight">{item.category}</p>}
                      {item.subcategory !== "none" && <p className="italic text-sm leading-tight text-slate-400">{item.subcategory}</p>}
                      {item.tags !== "none" && <div className="text-sm leading-tight text-darkButton1Bg truncate">{item.tags}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/*--- add item h-80px/110px ---*/}
            <div className="flex-none w-full h-[80px] flex items-center justify-center">
              <div className="button1ColorDark w-[200px] h-[60px] rounded-full flex items-center gap-[8px] justify-center desktop:cursor-pointer">
                <FaPlus className="text-[20px]" />
                <p className="text-lg font-semibold">Item</p>
              </div>
            </div>
          </div>
        </div>
        {/*--- menu ---*/}
        <div className="absolute bottom-0 left-0 flex-none w-full h-[80px] flex justify-center items-center bg-gradient-to-t from-[#03082E] to-blue-500/18 rounded-b-[48px]">
          <div className="w-full pb-[10px] flex items-center justify-around">
            {menuItems.map((i) => (
              <div
                className={`${
                  i.route === menu ? "text-slate-300" : "text-slate-600"
                } desktop:hover:text-slate-300 w-[90px] flex flex-col items-center justify-center gap-[0px] cursor-pointer`}
                key={i.text}
              >
                {i.icon}
                <p className="text-base">{i.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
