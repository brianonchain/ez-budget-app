import { FaAngleLeft, FaX } from "react-icons/fa6";

export default function Header({ title, page, setPage }: { title: string; page: string; setPage: any }) {
  return (
    <div className="flex-none w-[94%] max-w-[400px] h-[72px] flex items-center justify-between text-black ">
      <div
        className={`${page === "cost" ? "invisible" : ""} w-[40px] h-[40px] flex items-center justify-center desktop:cursor-pointer desktop:hover:text-slate-700`}
        onClick={() => {
          if (page === "name") {
            setPage("cost");
          } else if (page === "category") {
            setPage("name");
          }
        }}
      >
        <FaAngleLeft className="text-[30px]" />
      </div>
      <div className="grow text-center text-2xl font-semibold">{title}</div>
      <div className="w-[40px] h-[40px] flex items-center justify-center desktop:cursor-pointer desktop:hover:text-slate-700" onClick={() => setPage("list")}>
        <FaX className="text-[26px]" />
      </div>
    </div>
  );
}
