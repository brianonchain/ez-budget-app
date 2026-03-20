export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`w-full p-4 xs:p-6 bg-card border border-borderFaint rounded-2xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] dark:shadow-none ${className}`}
    >
      {children}
    </div>
  );
}
