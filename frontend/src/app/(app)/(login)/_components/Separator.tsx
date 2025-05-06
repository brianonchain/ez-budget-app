export default function Separator() {
  return (
    <div className="pt-8 pb-6 desktop:pt-6 desktop:pb-4 w-full flex items-center gap-[8px]">
      <div className="grow h-[1px] bg-slate-400 dark:bg-slate-600"></div>
      <div className="text-slate-500 dark:text-slate-600 text-base dektop:text-sm">or</div>
      <div className="grow h-[1px] bg-slate-400 dark:bg-slate-600"></div>
    </div>
  );
}
