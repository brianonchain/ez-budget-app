export default function Accordion({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  return (
    <div className={`grid ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"} [transition:opacity_500ms,grid-template-rows_300ms]`}>
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}
