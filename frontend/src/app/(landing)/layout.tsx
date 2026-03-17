export default async function Layout({ children }: { children: React.ReactNode }) {
  return <div className="dark bg-primaryBg text-textPrimary text-lg">{children}</div>;
}
