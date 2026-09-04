export default function ModalHeader({ titleId, title }: { titleId: string; title: string }) {
  return (
    <h2
      id={titleId}
      className="absolute z-[90] top-[env(safe-area-inset-top)] inset-x-0 px-[calc(var(--modalNavButtonSize)+var(--modalNavButtonOffset)+0.5rem)] h-(--modalHeaderHeight) flex items-center justify-center text-center textLg font-semibold pointer-events-none"
    >
      {title}
    </h2>
  );
}
