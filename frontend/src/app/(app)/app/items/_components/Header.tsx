export default function Header({ text, setItemModal, page }: { text: string; setItemModal: any; page: string }) {
  return (
    <div className="pageHeader">
      {text}
      {/*--- close ---*/}
      <div className="pageXButton" onClick={() => setItemModal(null)}>
        &#10005;
      </div>
    </div>
  );
}
