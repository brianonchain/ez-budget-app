import { ThemeProvider } from "next-themes";
import PWAGate from "./PWAGate";
import RegisterSW from "./RegisterSW";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app textBase min-h-screen">
      <RegisterSW />
      <PWAGate>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </PWAGate>
    </div>
  );
}
