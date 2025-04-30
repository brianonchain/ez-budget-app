import { ThemeProvider } from "next-themes";

export default async function Layout({ children }: { children: React.ReactNode }) {
  console.log("/(app)/layout.tsx");

  return (
    <div className="textBaseApp">
      <ThemeProvider attribute="class">{children}</ThemeProvider>
    </div>
  );
}
