import Menu from "./_components/Menu";
import ContextProvider from "@/context/ContextProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`w-full h-screen flex portrait:flex-col-reverse landscape:flex-row relative text-lg desktop:text-sm`} style={{ scrollbarGutter: "stable" }}>
      <Menu />
      <ContextProvider>{children}</ContextProvider>
    </div>
  );
}
