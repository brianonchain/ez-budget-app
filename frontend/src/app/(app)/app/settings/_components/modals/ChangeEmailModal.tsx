import { useState, useRef } from "react";
import { signOut } from "next-auth/react";
import { ImSpinner2 } from "react-icons/im";
import { FaCircleCheck } from "react-icons/fa6";
// utils
import { fetchPost, checkEmail } from "@/utils/functions";
import InputEmail from "@/utils/components/InputEmail";
import Modal from "@/utils/components/modal/Modal";
import Button from "@/utils/components/Button";

export default function EmailModal({ setEmailModal }: { setEmailModal: any }) {
  // hooks
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  // states
  const [newEmail, setNewEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [content, setContent] = useState<"changeEmail" | "verifyOtp" | "changed">("changeEmail");
  const [isLoading, setIsLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<"initial" | "sending" | "sent">("initial");
  const [otp, setOtp] = useState(Array(6).fill(""));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return; // avoid double submitting
    if (content === "changeEmail") createPendingEmailChange();
    if (content === "verifyOtp") verifyPendingEmailChange();
    if (content === "changed") {
      setIsLoading(true);
      signOut({ callbackUrl: "/login" }); // user must re-login with new email
    }
  }

  async function createPendingEmailChange() {
    // re-validate email, as hitting "Enter" does not trigger onBlur
    const _newEmail = newEmail.trim().toLowerCase();
    if (!_newEmail || !checkEmail(_newEmail)) {
      setErrorMessage("Please enter a valid email.");
      return;
    }
    // set status
    setErrorMessage("");
    setIsLoading(true);
    // call api
    try {
      const resJson = await fetchPost("/api/createPendingEmailChange", { newEmail: _newEmail });
      if (resJson.status === "success") {
        setContent("verifyOtp");
      } else {
        setErrorMessage(resJson.message || "Server error. Please try again.");
        setContent("changeEmail");
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Server error. Please try again.");
      setContent("changeEmail");
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyPendingEmailChange() {
    const joinedOtp = otp.join("");
    if (joinedOtp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(""); // if there is errors.submit

    try {
      const resJson = await fetchPost("/api/verifyPendingEmailChange", { newEmail, otp: joinedOtp });
      if (resJson.status === "success") {
        setContent("changed");
      } else {
        setErrorMessage(resJson.message || "Server error. Please try again.");
        setOtp(Array(6).fill(""));
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Server error. Please try again.");
      setOtp(Array(6).fill(""));
    } finally {
      setIsLoading(false);
    }
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

  async function resendCode() {
    if (isLoading) return; // avoid double sending
    setOtp(Array(6).fill(""));
    setResendStatus("sending");
    setIsLoading(true);
    try {
      const resJson = await fetchPost("/api/resendVerificationCode", { type: "resendCodeForEmailChange", email: newEmail });
      if (resJson.status === "success") {
        setResendStatus("sent");
      } else {
        setErrorMessage(resJson.message || "Server error. Please try again.");
        setResendStatus("initial");
      }
      setResendStatus("sent");
    } catch (e: any) {
      setErrorMessage(e?.message || "Server error. Please try again.");
      setResendStatus("initial");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal disabled={isLoading} onClose={() => setEmailModal(false)} title="Change Email">
      <form className="w-full" onSubmit={onSubmit}>
        {content === "changeEmail" && (
          <InputEmail
            // for InputEmail
            _id="email"
            label="New Email"
            isSignIn={false}
            // for Input
            inputSize="base"
            // for <input>
            onBlur={(e) => {
              if (e.currentTarget.value && !checkEmail(e.currentTarget.value)) {
                setErrorMessage("Please enter a valid email.");
              }
            }}
            onChange={(e) => setNewEmail(e.target.value)}
            value={newEmail}
          />
        )}
        {content === "verifyOtp" && (
          <div className="h-[100px] desktop:h-[80px] flex flex-col items-center justify-between">
            <div>Enter the 6-digit code sent to your email</div>
            <div className="flex items-center justify-center gap-1">
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
                  className="size-[52px] desktop:size-[51px] textXl text-center border-2 roundedButton inputPrimaryColor"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>
        )}
        {content === "changed" && (
          <div className="h-[100px] desktop:h-[80px] flex items-center justify-centerfont-medium">
            Email successfully changed! Please re-login with your new email.
          </div>
        )}

        {/*--- button ---*/}
        <Button
          className="w-full mt-8 flex justify-center items-center"
          label={
            content === "changeEmail" ? "Change Email" : content === "verifyOtp" ? "Verify" : content === "changed" ? "Re-login Now" : ""
          }
          variant="primary"
          size="base"
          isLoading={isLoading}
          type="submit"
        />

        {/*--- error message ---*/}
        <div className="py-2 text-textDanger font-medium min-h-13">{errorMessage || ""}</div>

        {/*--- resend code button ---*/}
        {content === "verifyOtp" && (
          <div className="mt-1 h-8 flex justify-center items-center">
            {resendStatus === "initial" && (
              <button className="mt-1 linkColor underline-animate" type="button" onClick={resendCode}>
                Resend verification code
              </button>
            )}
            {resendStatus === "sending" && "Sending email..."}
            {resendStatus === "sent" && (
              <div className="flex items-center gap-2">
                <FaCircleCheck className="text-green-500" />
                Email sent!
                <button className="inline-flex underline-animate linkColor" type="button" onClick={resendCode}>
                  Resend
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
