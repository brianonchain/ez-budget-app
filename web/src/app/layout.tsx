import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Geist } from "next/font/google";
// auth
import { getServerSession } from "next-auth";
import SessionProvider from "./SessionProvider";
import { authOptions } from "@/utils/authOptions";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "EZ Budget App",
  description: "Designed for speed and customizability, EZ Budget App is the easiest way to track daily expenses and maintain a budget.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // or "black-translucent"
  },
};

// so that PWA screen extends into top safe area
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    // geist.variable => load Geist and store it in --font-sans
    <html className={`dark bg-background ${geist.variable}`} suppressHydrationWarning lang="en">
      <body className="textBase antialiased">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
