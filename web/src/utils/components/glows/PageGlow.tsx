export default function PageGlow() {
  // use "fixed" instead "absolute" so overflow-hidden is not needed on parent
  // no need to center width as it's 100%
  return (
    <div className="hidden dark:block fixed z-0 top-1/2 -translate-y-1/2 w-[100%] h-[300%] pageGlow pointer-events-none" aria-hidden />
  );
}
