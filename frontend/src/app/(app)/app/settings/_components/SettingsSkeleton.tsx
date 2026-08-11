export default function SettingsSkeleton({ size = "sm", className = "" }: { size?: "sm" | "lg"; className?: string }) {
  const sizes = {
    sm: "w-22 desktop:w-18",
    lg: "w-full",
  };
  return <div className={`h-12 desktop:h-9 bg-blue-300/10 animate-pulse roundedButton ${sizes[size]} ${className}`} />;
}
