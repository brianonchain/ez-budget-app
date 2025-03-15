const ErrorModal = ({ errorModal, setErrorModal }: { errorModal: React.ReactNode; setErrorModal: any }) => {
  return (
    <div className="z-[200]">
      <div className="modalSmall">
        <div className="modalSmallContentContainer">
          {/*---text---*/}
          <div className="py-[40px]">{errorModal}</div>
          {/*--- button ---*/}
          <div className="modalButtonContainer">
            <button onClick={() => setErrorModal(null)} className="button1 modalButtonWidth">
              CLOSE
            </button>
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default ErrorModal;
