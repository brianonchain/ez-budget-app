export default async function Layout({ children }: { children: React.ReactNode }) {
  console.log("/(landing)/layout.tsx");

  return <div className="bg-darkBg1 text-darkText1 text-lg">{children}</div>;
}
