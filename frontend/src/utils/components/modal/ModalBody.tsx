export default function ModalBody({ contentMaxWidth, children }: { contentMaxWidth?: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto pt-6 desktop:pt-2 pb-12 desktop:pb-8 px-4 tablet:px-8 desktop:px-10 w-full thinScrollbar">
      {/*--- max-w here mainly defines mobile/tablet content width  ---*/}
      <div className={`mx-auto w-full max-w-100 ${contentMaxWidth} desktop:max-w-none flex flex-col`}>{children}</div>
    </div>
  );
}
