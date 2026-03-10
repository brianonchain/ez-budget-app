import { ThemeProvider } from "next-themes";
import PWAGate from "./PWAGate";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="textBaseApp">
      <PWAGate>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </PWAGate>
    </div>
  );
}
