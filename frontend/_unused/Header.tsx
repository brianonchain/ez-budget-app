export default function Header({ text, setItemModal, page }: { text: string; setItemModal: any; page: string }) {
  return (
    <div className="w-[94%] max-w-[400px] py-[24px] text-center text-2xl font-bold relative">
      {text}
      {/*--- close ---*/}
      <div
        className="absolute right-[-8px] top-[4px] w-[60px] h-[60px] desktop:w-[50px] desktop:h-[50px] text-[32px] desktop:text-[28px] font-bold flex items-center justify-center rounded-lg cursor-pointer hover:bg-buttonTransparentHover active:bg-buttonTransparentHover"
        onClick={() => setItemModal(null)}
      >
        &#10005;
      </div>
    </div>
  );
}
