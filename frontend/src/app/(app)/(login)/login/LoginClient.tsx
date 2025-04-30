"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
// components
import LoginThemeToggle from "../_components/LoginThemeToggle";
import SignInGoogle from "../_components/SignInGoogle";
import Separator from "../_components/Separator";
import InputEmail from "../_components/InputEmail";
import InputPassword from "../_components/InputPassword";
import Button from "@/utils/components/Button";
// utils
import { checkEmail, checkPassword, fetchPost } from "@/utils/functions";
import ErrorModal from "@/utils/components/ErrorModal";
import Accordion from "@/utils/components/Accordion";

export default function Login() {
  console.log("(app)/login/_components/Login.tsx");

  // hooks
  const router = useRouter();

  // states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", password2: "" });
  const [isLoading, setIsLoading] = useState<string | null>(null); // google | email | null
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

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
        setErrors((errors) => ({ ...errors, password: "Incorrect password" }));
        return false;
      }
    }
    setErrors((errors) => ({ ...errors, password: "" }));
    return true; // returns true even if no password because don't want error to show
  }

  async function onClickButton() {
    if (isEmailVerified) {
      signInWithEmail();
    } else {
      if (email && !errors.email) {
        setIsEmailVerified(true);
      }
    }
  }

  async function signInWithEmail() {
    if (!email || !password || errors.email || errors.password) return; // !email || !password needed because no prior validation if email/password is empty
    setIsLoading("email");
    var res = await signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
      callbackUrl: "/app/items",
    });
    // if sign in error or success
    if (res?.error) {
      setErrorModal(res.error);
      setIsLoading(null);
      setPassword("");
    } else if (res?.url) {
      router.push(res.url);
    }
  }

  return (
    <>
      <LoginThemeToggle />
      <SignInGoogle label="Sign in with Google" />
      <Separator text="Or with email and password" />
      <form className="w-full flex flex-col">
        <InputEmail error={errors.email} onBlur={(e) => validateEmail(e.target.value)} onChange={(e) => setEmail(e.target.value)} value={email} autoComplete="username" />
        <Accordion isOpen={isEmailVerified}>
          <InputPassword
            className="pt-[14px] pb-[8px]"
            label="Password"
            error={errors.password}
            onBlur={validatePassword}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            autoComplete="current-password"
          />
        </Accordion>
        <Button className="mt-[16px]" label={isEmailVerified ? "Login" : "Next"} isLoading={isLoading === "email" ? true : false} onClick={onClickButton} />
      </form>

      {/*--- other options ---*/}
      <div className="mt-[60px] desktop:mt-[50px] w-full flex flex-col gap-[40px] desktop:gap-[30px] items-center textSmApp">
        <div className="link underline-animate" onClick={() => router.push("/signup")}>
          New user? Sign up here
        </div>
        <div className="link underline-animate" onClick={() => router.push("/new-password")}>
          Forget password?
        </div>
      </div>
      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </>
  );
}
