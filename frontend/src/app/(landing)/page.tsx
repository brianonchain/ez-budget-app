import Navbar from "./_components/Navbar";
import Hero from "./_components/Hero";

export default async function page() {
  console.log("page.tsx");
  return (
    <div className="text-lg">
      <div className="w-full flex justify-center bg-darkBg1 text-darkText1">
        <Hero />
      </div>
    </div>
  );
}
