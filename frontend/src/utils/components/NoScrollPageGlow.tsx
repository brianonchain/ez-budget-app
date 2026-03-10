export default function NoScrollPageGlow() {
  return (
    <div className="z-[0] absolute bottom-0 left-1/2 -translate-x-1/2 w-screen h-full bg-[radial-gradient(circle_at_50%_150%,#0444B7,transparent_70%)] pointer-events-none" />
  );
}
