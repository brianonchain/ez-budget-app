export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full p-4 xs:p-6 bg-card border border-borderFaint rounded-2xl cardShadow ${className}`}>{children}</div>;
}
