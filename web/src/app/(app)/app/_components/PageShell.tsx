import { cn } from "@/utils/functions";

export default function PageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("w-full tablet:max-w-150 desktop:max-w-140 p-4 tablet:p-6 flex flex-col gap-4", className)}>{children}</div>;
}
