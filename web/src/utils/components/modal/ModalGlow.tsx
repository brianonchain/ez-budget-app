export default function ModalGlow() {
  // no need to center width as it's 100%
  return (
    <div className="hidden dark:block absolute z-0 top-1/2 -translate-y-1/2 w-[100%] h-[200%] modalGlow pointer-events-none" aria-hidden />
  );
}
