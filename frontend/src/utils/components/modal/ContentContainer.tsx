const modalPadding =
  "px-4 tablet:px-12 desktop:px-10 pt-[calc(env(safe-area-inset-top)+var(--modalHeaderHeight)+1rem)] pb-16 tablet:pb-12 desktop:pb-10";

export default function ContentContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`relative z-[10] flex-1 min-h-0 overflow-y-auto w-full ${modalPadding} overscroll-contain topFade tablet:thinScroll modalScroll`}
    >
      {children}
    </div>
  );
}
