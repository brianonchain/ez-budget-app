import Hero from "./_components/Hero";

export default async function page() {
  console.log("/(landing)/page.tsx");
  return (
    <div className="w-full flex justify-center overflow-x-hidden">
      <Hero />
    </div>
  );
}
