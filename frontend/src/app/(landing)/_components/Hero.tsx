import Link from "next/link";
import Ani from "./Ani";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";

export default async function Hero() {
  const session = await getServerSession(authOptions);
  console.log(session);

  return (
    <div className="homeSectionSize min-h-[max(100vh,700px)] grid grid-cols-1 lg:grid-cols-[55%_45%] gap-[12px] lg:gap-0 relative">
      {/*--- radial gradient ---*/}

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-screen h-full bg-[radial-gradient(circle_at_50%_150%,#0444B7,transparent_70%)] pointer-events-none" />
      {/*--- text ---*/}
      <div className="mt-[60px] lg:mt-0 w-full flex flex-col items-start lg:justify-center gap-[20px] text-center lg:text-start">
        <div className="text-[58px] leading-[1.2] font-bold">
          Track expenses <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#63CDF6] to-[#B568FF]">with fewer clicks</span>
        </div>
        <div className="text-xl leading-[1.6]">Use EZ Budget App to track your daily expenses with speed and customizability.</div>
        <Link className="mt-4 homeButton mx-auto lg:mx-0" href={session ? "/app/items" : "/login"}>
          Enter App
        </Link>
      </div>
      {/*--- animation ---*/}
      <Ani />
    </div>
  );
}
