export default function Separator({ text }: { text: string }) {
  return (
    <div className="pt-[24px] pb-[12px] w-full flex items-center gap-[8px]">
      <div className="grow h-[1px] bg-slate-400 dark:bg-slate-600"></div>
      <div className="text-slate-500 dark:text-slate-600">{text}</div>
      <div className="grow h-[1px] bg-slate-400 dark:bg-slate-600"></div>
    </div>
  );
}
