export default function TextSkeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-primaryBg dark:bg-card animate-pulse rounded-md text-transparent select-none ${className}`}>0</div>;
}
