import { useId } from "react";

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
  const titleId = useId();

  return (
    <div className="fixed inset-0 z-[50]">
      <div className="fixed inset-0 bg-black/70 z-[0]"></div>
      <div
        className="modalFullColor modalFullSize desktop:pb-[12px] fixed z-[1] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col desktop:rounded-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1} // so modal is focusable with javascript
      >
        {/*--- glow ---*/}
        <div className="absolute inset-0 bg-gradient-to-br from-lightBg1 to-lightBg1 dark:from-blue-500/20 dark:to-blue-500/10 z-[-1]"></div>
        {/*--- close ---*/}
        {!disableCloseButton && (
          <button className="xButton" aria-label="Close" onClick={() => setIsOpen(false)}>
            &#10005;
          </button>
        )}
        {/*--- title ---*/}
        <div id={titleId} className="modalFullHeader">
          {title}
        </div>
        {/*--- content ---*/}
        <div className="modalFullContentContainer">{children}</div>
      </div>
    </div>
  );
}
