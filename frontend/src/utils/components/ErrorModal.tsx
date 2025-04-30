const ErrorModal = ({ errorModal, setErrorModal }: { errorModal: React.ReactNode; setErrorModal: any }) => {
  return (
    <div className="z-[200]">
      <div className="modalSmall overflow-hidden">
        {/*---content---*/}
        <div className="grow modalSmallContentContainer justify-center">{errorModal}</div>
        {/*--- button ---*/}
        <div className="modalButtonContainer">
          <button onClick={() => setErrorModal(null)} className="button1 modalButtonWidth">
            CLOSE
          </button>
        </div>
        {/*--- glow ---*/}
        <div className="absolute w-full h-full left-0 top-0 bg-gradient-to-br from-lightBg1 to-lightBg1 dark:from-blue-500/30 dark:to-blue-500/10 z-[-1]"></div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
};

export default ErrorModal;
