export default function SettingsCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="mt-4 portrait:sm:mt-8 landscape:lg:mt-8 desktop:!mt-4 pb-5 px-[12px] portrait:sm:px-5 landscape:lg:px-5 desktop:px-4 w-full bg-card rounded-2xl shadow-[0px_0px_16px_0px_rgba(0,0,0,0.1)] desktop:shadow-[6px_0px_10px_0px_rgba(0,0,0,0.02),_-6px_0px_10px_rgba(0,0,0,0.02)] dark:shadow-none">
      <div className="w-full pt-5 pb-4 text-2xl font-bold flex items-center justify-center text-button1Bg dark:text-text1">{title}</div>
      {children}
    </div>
  );
}
