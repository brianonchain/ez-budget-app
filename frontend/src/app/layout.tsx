import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Inter } from "next/font/google";
// auth
import { getServerSession } from "next-auth";
import SessionProvider from "./SessionProvider";
import { authOptions } from "@/utils/authOptions";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EZ Budget App",
  description: "Designed for speed and customizability, EZ Budget App is the easiest way to track daily expenses and maintain a budget.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // or "black-translucent"
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// contains font color
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html className="dark bg-bgPrimary" suppressHydrationWarning lang="en">
      <body className={`${inter.className} bg-bgPrimary text-textPrimary textBase antialiased`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
