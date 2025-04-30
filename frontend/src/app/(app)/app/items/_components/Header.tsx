export default function Header({ text, setPage, page }: { text: string; setPage: any; page: string }) {
  return (
    <div className="pageHeader">
      {text}
      {/*--- close ---*/}
      <div className="pageXButton" onClick={() => setPage(page)}>
        &#10005;
      </div>
    </div>
  );
}
