export default function Modal({
  children,
  disableCloseButton,
  setIsOpen,
  title,
}: {
  children: React.ReactNode;
  disableCloseButton: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
}) {
  return (
    <div>
      <div className="modalFull">
        {/*--- glow ---*/}
        <div className="absolute w-full h-full left-0 top-0 bg-gradient-to-br from-lightBg1 to-lightBg1 dark:from-blue-500/20 dark:to-blue-500/10 z-[-1]"></div>
        {/*--- close ---*/}
        {!disableCloseButton && (
          <button className="xButton" onClick={() => setIsOpen(false)}>
            &#10005;
          </button>
        )}
        {/*--- title ---*/}
        <div className="modalFullHeader">{title}</div>
        {/*--- content ---*/}
        <div className="modalFullContentContainer">{children}</div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
