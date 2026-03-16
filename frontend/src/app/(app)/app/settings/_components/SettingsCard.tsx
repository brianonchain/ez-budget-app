export default function SettingsCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="mt-4 portrait:sm:mt-8 landscape:lg:mt-8 desktop:!mt-4 pb-5 px-[12px] xs:px-6 w-full bg-card rounded-2xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] dark:shadow-none">
      <div className="w-full pt-5 pb-4 text-2xl font-bold flex items-center justify-center text-buttonPrimaryBg dark:text-textPrimary">
        {title}
      </div>
      {children}
    </div>
  );
}
