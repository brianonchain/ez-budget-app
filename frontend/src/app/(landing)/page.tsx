import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";
import { getServerSession } from "next-auth";

export default async function page() {
  const session = await getServerSession();

  return (
    <div className="overflow-x-hidden text-lg">
      <div className="w-full flex justify-center bg-darkBg1 text-darkText1">
        <Hero />
      </div>
    </div>
  );
}
