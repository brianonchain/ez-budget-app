export default function PageGlow() {
  return (
    <div
      className="fixed z-0 w-[200dvw] portrait:h-[200dvh] landscape:h-[150dvw] pageGlow right-0 translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none hidden dark:block overflow-hidden"
      aria-hidden
    />
  );
}
