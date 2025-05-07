import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import SessionProvider from "./SessionProvider";
// import "react-day-picker/style.css";
import "@/styles/calendar.css";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EZ Budget App",
  description: "Designed for speed and customizability, EZ Budget App is the easiest way to track daily expenses and maintain a budget.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  return (
    <html suppressHydrationWarning lang="en">
      <body className={`text-lightText1 dark:text-darkText1 ${inter.className} antialiased`}>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
