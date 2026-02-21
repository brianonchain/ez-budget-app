import Spinner from "@/utils/components/Spinner";

export default function loading() {
  return (
    <div className="appPageContainer justify-center items-center bg-lightBg1 dark:bg-darkBg1 relative z-0">
      <Spinner />
      {/* --- glow --- */}
      <div className="z-0 fixed w-full h-full left-0 top-0 pointer-events-none glowDark" aria-hidden>
        <div className="absolute top-1/2 right-0 translate-y-[-50%] translate-x-[50%] w-[200%] h-[100%] glowDarkInner" />
      </div>
    </div>
  );
}
