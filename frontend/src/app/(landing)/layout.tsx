export default async function Layout({ children }: { children: React.ReactNode }) {
  return <div className="dark bg-bg1 text-textPrimary text-lg">{children}</div>;
}
