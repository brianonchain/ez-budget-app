export default function PageGlow() {
  return (
    <div className="z-0 fixed w-full h-full left-0 top-0 pointer-events-none glowDark" aria-hidden>
      <div className="absolute top-1/2 right-0 translate-y-[-50%] translate-x-[50%] w-[200%] h-[80%] glowDarkInner" />
    </div>
  );
}
