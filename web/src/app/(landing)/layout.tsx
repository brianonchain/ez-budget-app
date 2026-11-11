// this code injects these meta tags in <head>:
// <meta name="theme-color" media="(prefers-color-scheme: light)" content="#0a0826">
// <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0826">
// export const viewport = {
//   themeColor: [
//     { media: "(prefers-color-scheme: light)", color: "#0a0826" },
//     { media: "(prefers-color-scheme: dark)", color: "#0a0826" },
//   ],
// };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/*--- glow ---*/}
      <div className="fixed z-0 top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_calc(100%+200px),#0444B7,transparent_70%)] pointer-events-none overflow-hidden" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
