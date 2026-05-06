import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import SessionProvider from "./SessionProvider";
import "react-day-picker/style.css";
import "@/styles/globals.css";
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
