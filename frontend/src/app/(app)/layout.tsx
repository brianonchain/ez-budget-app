import { ThemeProvider } from "next-themes";
import PWAGate from "./PWAGate";
import InitSWAndNotifications from "./InitSWAndNotifications";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app textBase">
      <InitSWAndNotifications />
      <PWAGate>
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </PWAGate>
    </div>
  );
}
