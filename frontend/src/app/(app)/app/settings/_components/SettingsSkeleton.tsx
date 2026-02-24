export default function SettingsSkeleton({ className }: { className?: string }) {
  return <div className={`w-[64px] desktop:w-[52px] h-[32px] desktop:h-[24px] bg-blue-300/10 animate-pulse rounded-md ${className}`} />;
}
