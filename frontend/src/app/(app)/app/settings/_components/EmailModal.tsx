import { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
// utils
import { checkPassword, fetchPost } from "@/utils/functions";
import InputEmail from "@/utils/components/InputEmail";
import { FaCircleCheck } from "react-icons/fa6";
import { checkEmail } from "@/utils/functions";

const defaultErrors = { email: "", submit: "" };

export default function PasswordModal({ setEmailModal }: { setEmailModal: any }) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState(defaultErrors);
  const [isSamePassword, setIsSamePassword] = useState(false);
  const [status, setStatus] = useState("initial"); // "initial" | "loading" | "sent"

  function validateEmail(email: string) {
    if (email) {
      const isValidEmail = checkEmail(email); // returns undefined or false
      if (!isValidEmail) {
        setErrors({ ...errors, email: "Email is invalid" });
        return false;
      }
    }
    setErrors({ ...errors, email: "" });
    return true; // returns true even if no email because don't want error to show
  }

  async function onButtonClick() {
    if (status === "sent") {
      setEmailModal(false);
    } else if (status === "initial") {
      if (!email || errors.email) return; // !email needed because no prior validation
      setStatus("loading");
      try {
        const resJson = await fetchPost("/api/changeEmail", { email });
        if (resJson.status === "success") {
          setErrors(defaultErrors);
          setStatus("sent");
          setEmail("");
          return;
        } else if (resJson.status === "error") {
          setErrors({ ...errors, submit: resJson.message });
          setStatus("initial");
          return;
        }
      } catch (e) {}
      setErrors({ ...errors, submit: "Server error. Please try again." });
      setStatus("initial");
    }
  }

  return (
    <div>
      <div className="modalFull">
        {/*--- glow ---*/}
        <div className="absolute w-full h-full left-0 top-0 bg-gradient-to-br from-lightBg1 to-lightBg1 dark:from-blue-500/20 dark:to-blue-500/10 z-[-1]"></div>
        {/*--- close ---*/}
        <div className="xButton" onClick={() => setEmailModal(false)}>
          &#10005;
        </div>
        {/*--- title ---*/}
        <div className="modalFullHeader">Change Email</div>
        {/*--- content ---*/}
        <div className="modalFullContentContainer">
          <div className="mx-auto pt-[24px] w-full max-w-[380px] desktop:!max-w-[300px]">
            {status != "sent" ? (
              <div className="w-full h-[300px] desktop:h-[240px] space-y-[23px]">
                <InputEmail
                  label="Enter new email"
                  error={errors.email}
                  onBlur={(e) => validateEmail(e.target.value)}
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  autoComplete="email"
                />
              </div>
            ) : (
              <div className="w-full h-[300px] desktop:h-[240px] flex items-center justify-center gap-[6px] font-medium">
                <FaCircleCheck className="text-[20px] desktop:text-[18px] text-green-500" />
                Email successfully changed!
              </div>
            )}
            {/*--- button ---*/}
            <button onClick={onButtonClick} className="button1 mt-[40px] w-full flex justify-center items-center" type="button">
              {status === "initial" && <p>Submit</p>}
              {status === "loading" && <ImSpinner2 className="animate-spin text-[32px] desktop:text-[24px]" />}
              {status === "sent" && !errors.submit && <p>Close</p>}
            </button>
            {/*--- error message ---*/}
            {errors.submit && <div className="mt-[8px] mb-[40px] text-red-500 font-medium">{errors.submit}</div>}
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
