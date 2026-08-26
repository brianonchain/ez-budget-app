"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/utils/components/Button";
import ErrorModal from "@/utils/components/simpleModal/ErrorModal";
import { signIn } from "next-auth/react";
import { fetchPost, normalizeEmail } from "@/utils/functions";

export default function VerifyUserClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // automatically decodes percent encoding
  const _email = normalizeEmail(String(email || ""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState("initial"); // "initial" | "sending" | "sent"

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
    inputsRef.current[5]?.focus(); // focus last input
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return; // "Enter" key bypasses disabled buttons
    const joinedOtp = otp.join("");

    // check OTP and email validity
    if (joinedOtp.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit code.");
      return;
    }
    if (!email) {
      setErrorMessage("Missing email");
      return;
    }

    setIsLoading(true);

    try {
      const resJson = await fetchPost("/api/verifyPendingUser", { email: _email, otp: joinedOtp }); // this API checks if OTP is invalid or expired
      if (resJson.status === "success") {
        // signIn() creates new user and consumes OTP (see authOptions.ts)
        const signInRes = await signIn("credentials", {
          email: _email,
          otp: joinedOtp,
          redirect: false,
        });
        // if signIn success or error
        if (signInRes?.error) {
          triggerError("Something went wrong. Please try again.");
        } else {
          window.location.href = "/app/items"; // absence of signInRes.error indicates success
        }
      } else {
        triggerError(resJson.message || "Server error. Please try again.");
        setIsLoading(false);
      }
    } catch (e: any) {
      triggerError(e?.message || "Server error. Please try again."); // optional chaining is needed
      setIsLoading(false);
    }
  }

  async function resendVerificationCode() {
    if (resendStatus === "sending") return; // avoid double sending
    setOtp(Array(6).fill(""));
    setResendStatus("sending");
    try {
      const resJson = await fetchPost("/api/resendVerificationCode", { type: "resendCodeForNewUser", email: _email });
      if (resJson.status === "success") {
        setResendStatus("sent");
      } else {
        setErrorMessage(resJson.message || "Server error. Please try again.");
        setResendStatus("initial");
      }
    } catch (e: any) {
      setErrorMessage(e?.message || "Server error. Please try again."); // optional chaining is needed
      setResendStatus("initial");
    }
  }

  function triggerError(message: string) {
    setErrorMessage(message);
    setIsLoading(false);
    clearOtp();
  }

  function clearOtp() {
    setOtp(Array(6).fill(""));
    inputsRef.current[0]?.focus();
  }

  return (
    <>
      <h1 className="w-full text-center">Enter the 6-digit code we sent to your email</h1>
      {/*--- 6 boxes, 50*6+8*5=340px ---*/}
      <form className="w-full flex flex-col items-center" onSubmit={onSubmit}>
        <div className="mt-[24px] flex gap-[6px]">
          {otp.map((digit, index) => (
            <input
              className="w-13 h-14 desktop:w-[2.8125rem] desktop:h-[2.8125rem] text-[24px] text-center rounded-xl inputPrimaryColor"
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
              disabled={isLoading}
            />
          ))}
        </div>
        <Button className="mt-[64px] w-full" label="Submit" variant="primary" size="base" isLoading={isLoading} type="submit" />
      </form>
      {resendStatus === "initial" && (
        <button className="mt-[60px] linkColor underline-animate" onClick={resendVerificationCode} type="button">
          Resend verification code
        </button>
      )}
      {resendStatus === "sending" && <div className="mt-[60px]">Sending email...</div>}
      {resendStatus === "sent" && (
        <div className="mt-[64px] ">
          Email sent!{" "}
          <button className="inline-flex underline-animate linkColor" type="button" onClick={resendVerificationCode}>
            Resend email
          </button>
        </div>
      )}

      {errorMessage && <ErrorModal errorMessage={errorMessage} onClose={() => setErrorMessage("")} />}
    </>
  );
}
