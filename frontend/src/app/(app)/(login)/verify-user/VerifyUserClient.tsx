"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/utils/components/Button";
import ErrorModal from "@/utils/components/ErrorModal";
import { signIn } from "next-auth/react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // automatically decodes percent encoding

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [errorModal, setErrorModal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState("initial");

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

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

  async function verifyOtp() {
    const joinedOtp = otp.join("");

    if (joinedOtp.length !== 6) {
      setErrorModal("Please enter a valid 6-digit code.");
      return;
    }

    if (!email) {
      setErrorModal("Missing email");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/verifyPendingUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: joinedOtp }),
      });
      const resJson = await res.json();

      if (resJson.status === "success") {
        console.log("password", resJson.data);
        const signInRes = await signIn("credentials", {
          email: email,
          password: resJson.data,
          redirect: false,
          callbackUrl: "/app/items",
        });
        // if sign in error or success
        console.log("signInRes", signInRes);
        if (signInRes?.error) {
          console.log(signInRes?.error);
          setErrorModal("Unknown error");
          setIsLoading(false);
        } else if (signInRes?.url) {
          router.push(signInRes.url);
        }
      } else {
        setIsLoading(false);
        setErrorModal(resJson.message || "Verification failed");
      }
    } catch (err) {
      setIsLoading(false);
      setErrorModal("Something went wrong.");
    }
  }

  return (
    <>
      <h1 className="w-[350px] text-[18px] desktop:text-[16px] text-center">Enter the 6-digit code sent to your email</h1>
      {/*--- 6 boxes, 50*6+8*5=340px ---*/}
      <div className="mt-[24px] flex gap-[8px]">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onChange={(e) => handleChange(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-[50px] h-[50px] text-[24px] text-center border-2 rounded-[8px] inputColor text-lightButton1Bg dark:text-darkButton1Bg"
            disabled={isLoading}
          />
        ))}
      </div>
      <Button className="mt-[32px] w-[340px]!" label="Verify" isLoading={isLoading} onClick={verifyOtp} />
      {resendStatus === "initial" && <div className="mt-[60px] link underline-animate">Resend email</div>}
      {resendStatus === "sending" && <div className="mt-[60px] ">Sending email...</div>}
      {resendStatus === "sent" && (
        <div className="mt-[60px] ">
          Email sent! <span className="link underline-animate">Resend email</span>
        </div>
      )}

      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </>
  );
}
