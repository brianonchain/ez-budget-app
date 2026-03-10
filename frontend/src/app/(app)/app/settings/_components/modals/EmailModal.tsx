import { useState, useRef } from "react";
import { signOut } from "next-auth/react";
// images
import { ImSpinner2 } from "react-icons/im";
// utils
import { fetchPost, checkEmail } from "@/utils/functions";
import InputEmail from "@/utils/components/InputEmail";
import Modal from "@/utils/components/Modal";

const defaultErrors = { email: false, submit: "" };
const defaultStatus = { content: "changeEmail", button: "changeEmail" };

export default function EmailModal({ setEmailModal }: { setEmailModal: any }) {
  // hooks
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  // states
  const [newEmail, setNewEmail] = useState("");
  const [errors, setErrors] = useState(defaultErrors);
  const [status, setStatus] = useState(defaultStatus); // "changeEmail" | "verifyOtp" | "changed", button can be "loading"
  const [otp, setOtp] = useState(Array(6).fill(""));

  function validateEmail(email: string) {
    setErrors((prev) => ({ ...prev, email: !!email && !checkEmail(email) }));
  }

  async function onButtonClick(e: React.FormEvent) {
    e.preventDefault();
    if (status.button === "changeEmail") createPendingEmailChange();
    if (status.button === "verifyOtp") verifyPendingEmailChange();
    if (status.button === "changed") {
      setStatus({ ...status, button: "loading" });
      signOut({ callbackUrl: "/login" }); // user must re-login with new email
    }
    // if status.button = "loading", then nothing happens
  }

  async function createPendingEmailChange() {
    // re-validate email, as hitting "Enter" does not trigger onBlur
    const _newEmail = newEmail.trim().toLowerCase();
    const isEmailValid = !!_newEmail && checkEmail(_newEmail);
    setErrors({ email: !isEmailValid, submit: isEmailValid ? "" : "Please enter a valid email." });
    if (!isEmailValid) return;

    setStatus((prev) => ({ ...prev, button: "loading" }));

    try {
      const resJson = await fetchPost("/api/createPendingEmailChange", { newEmail: _newEmail });
      if (resJson.status === "success") {
        setStatus({ content: "verifyOtp", button: "verifyOtp" });
      } else {
        setErrors((prev) => ({ ...prev, submit: resJson.message || "Server error. Please try again." }));
        setStatus(defaultStatus);
      }
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, submit: e?.message || "Server error. Please try again." }));
      setStatus(defaultStatus);
    }
  }

  async function verifyPendingEmailChange() {
    const joinedOtp = otp.join("");
    if (joinedOtp.length !== 6) {
      setErrors({ ...errors, submit: "Please enter a valid 6-digit code." });
      return;
    }

    setStatus({ ...status, button: "loading" });
    setErrors(defaultErrors); // if there is errors.submit

    try {
      const resJson = await fetchPost("/api/verifyPendingEmailChange", { newEmail, otp: joinedOtp });
      if (resJson.status === "success") {
        setStatus({ content: "changed", button: "changed" });
        return;
      } else if (resJson.status === "error") {
        setErrors({ ...errors, submit: resJson.message });
        setStatus(defaultStatus);
        setOtp(Array(6).fill(""));
        return;
      }
    } catch (e) {}
    setErrors({ ...errors, submit: "Server error. Please try again." });
    setStatus(defaultStatus);
    setOtp(Array(6).fill(""));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const value = e.target.value.replace(/\D/g, ""); // only digits

    if (!value) {
      setOtp((prev) => {
        const newOtp = [...prev];
        newOtp[index] = "";
        return newOtp;
      });
      return;
    }

    const split = value.split("");

    setOtp((prev) => {
      const newOtp = [...prev];
      split.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      return newOtp;
    });

    if (split.length > 1) {
      const nextIndex = Math.min(index + split.length, 5);
      inputsRef.current[nextIndex]?.focus();
    } else {
      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault(); // stop default paste

    const pasted = e.clipboardData.getData("text").replace(/\D/g, ""); // only digits

    if (pasted.length !== 6) {
      return; // ignore bad paste
    }

    setOtp(pasted.split(""));

    // focus last input
    inputsRef.current[5]?.focus();
  }

  return (
    <Modal disableCloseButton={status.button === "loading"} setIsOpen={setEmailModal} title="Change Email">
      <form className="w-full h-[175px] inputMaxWidth" onSubmit={onButtonClick}>
        {status.content === "changeEmail" && (
          <InputEmail
            _id="email"
            className="w-full"
            label="New Email"
            isError={errors.email}
            errorMsg="Invalid email"
            onBlur={(e) => validateEmail(e.target.value)}
            onChange={(e) => setNewEmail(e.target.value)}
            value={newEmail}
            autoComplete="email"
            disabled={status.button === "loading" ? true : false}
          />
        )}
        {status.content === "verifyOtp" && (
          <div className="h-[100px] desktop:h-[80px] flex flex-col items-center justify-between">
            <div>Enter the 6-digit code sent to your email</div>
            <div className="flex items-center justify-center gap-[8px]">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onChange={(e) => handleChange(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-[52px] h-[52px] desktop:w-[43px] desktop:h-[43px] text-[18px] text-center border-2 rounded-lg inputColor"
                  disabled={status.button === "loading" ? true : false}
                />
              ))}
            </div>
          </div>
        )}
        {status.content === "changed" && (
          <div className="h-[100px] desktop:h-[80px] flex items-center justify-centerfont-medium">
            Email successfully changed! Please re-login with your new email.
          </div>
        )}
        {/*--- button ---*/}
        <button className="button1 mt-[24px] w-full flex justify-center items-center" type="submit">
          {status.button === "changeEmail" && <p>Change Email</p>}
          {status.button === "verifyOtp" && <p>Verify</p>}
          {status.button === "loading" && <ImSpinner2 className="animate-spin text-[32px] desktop:text-[24px]" />}
          {status.button === "changed" && !errors.submit && <p>Re-Login</p>}
        </button>
        {/*--- error message ---*/}
        {errors.submit && <div className="mt-[8px] errorText font-medium">{errors.submit}</div>}
      </form>
    </Modal>
  );
}
