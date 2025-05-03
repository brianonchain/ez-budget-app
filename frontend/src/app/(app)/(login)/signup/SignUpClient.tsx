"use client";
// nextjs
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// components
import SignInGoogle from "../_components/SignInGoogle";
import Separator from "../_components/Separator";
import LoginThemeToggle from "../_components/LoginThemeToggle";
// utils
import { checkEmail, checkPassword, fetchPost } from "@/utils/functions";
import InputEmail from "@/utils/components/InputEmail";
import InputPassword from "@/utils/components/InputPassword";
import ErrorModal from "@/utils/components/ErrorModal";
import Button from "@/utils/components/Button";

export default function Login() {
  console.log("(app)/login/_components/Login.tsx");

  // hooks
  const router = useRouter();

  // states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", password2: "" });
  const [isSamePassword, setIsSamePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);

  // redirect to /saveToHome if mobile & not standalone
  useEffect(() => {
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isDesktop && !isStandalone && process.env.NODE_ENV != "development") {
      router.push("/saveAppToHome");
      return;
    }
  }, []);

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

  async function validatePassword() {
    if (password) {
      const isPasswordValid = checkPassword(password);
      if (!isPasswordValid) {
        setErrors((errors) => ({ ...errors, password: "Must be \u2265 8 characters and contain a lowercase letter, an uppercase letter, and a number" }));
        return false;
      }
    }
    setErrors((errors) => ({ ...errors, password: "" }));
    return true; // returns true even if no password because don't want error to show
  }

  function validatePassword2() {
    if (!password2) {
      // don't want to show error if no repeatedPassword
      setIsSamePassword(false);
      setErrors((errors) => ({ ...errors, password2: "" })); // requires to get prevState as validatePassword & validatePassword2 might be run at same time
    } else {
      if (password === password2) {
        setIsSamePassword(true);
        setErrors((errors) => ({ ...errors, password2: "" }));
      } else {
        setIsSamePassword(false);
        setErrors((errors) => ({ ...errors, password2: "Password does not match" }));
      }
    }
  }

  async function signUp() {
    if (!email || !password || !isSamePassword || errors.email || errors.password || errors.password2) return; // "!email || !password" is needed because no prior validation if email/password is empty
    setIsLoading(true);

    try {
      const resJson = await fetchPost("/api/createPendingUser", { email, password });
      if (resJson === "success") {
        router.push(`/verify-user?email=${encodeURIComponent(email)}`);
      } else if (resJson.status === "error") {
        setErrorModal(resJson.message);
        setIsLoading(false);
      } else {
        setErrorModal("Server error");
        setIsLoading(false);
      }
    } catch (e) {
      setErrorModal("Server error");
      setIsLoading(false);
    }
  }

  return (
    <>
      <LoginThemeToggle />
      <SignInGoogle label="Sign up with Google" />
      <Separator text="Or sign up with an email & password" />

      {/*--- form ---*/}
      <form className="w-full flex flex-col gap-[12px]">
        <InputEmail
          label="Email"
          error={errors.email}
          onBlur={(e) => validateEmail(e.target.value)}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          autoComplete="email"
        />
        <InputPassword
          label="Password"
          tooltip={true}
          error={errors.password}
          onBlur={validatePassword}
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          autoComplete="new-password"
        />
        <InputPassword
          label="Re-enter Password"
          error={errors.password2}
          onBlur={validatePassword2}
          onChange={(e) => setPassword2(e.target.value)}
          value={password2}
          autoComplete="new-password"
        />
        <Button className="mt-[8px]" label="Sign Up" isLoading={isLoading} onClick={signUp} disabled={isLoading} />
      </form>

      {/*--- other options ---*/}
      <p className="mt-[40px] desktop:mt-[30px] link underline-animate textSmApp" onClick={() => router.push("/login")}>
        Already a user? Login
      </p>
      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </>
  );
}
