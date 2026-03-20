import Card from "@/utils/components/Card";

export default function SettingsCard({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <Card className={`${className}`}>
      <div className="w-full pt-2 pb-4 text-2xl font-bold flex items-center justify-center text-buttonPrimaryBg dark:text-textPrimary">
        {title}
      </div>
      {children}
    </Card>
  );
}
