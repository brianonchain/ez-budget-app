"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
// components
import SignInButton from "../_components/SignInButton";
import Button from "@/utils/components/Button";
// utils
import { checkEmail, checkPassword } from "@/utils/functions";
import InputEmail from "@/utils/components/InputEmail";
import InputPassword from "@/utils/components/InputPassword";
import ErrorModal from "@/utils/components/ErrorModal";
import Accordion from "@/utils/components/Accordion";
// images
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

const errorMap: Record<string, string> = {
  OAuthSignin: "Could not start sign-in.",
  OAuthCallback: "Sign-in failed. Please try again.",
  OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
  AccessDenied: "You cancelled the sign-in.",
  Configuration: "Server configuration error.",
};

export default function Login() {
  console.log("(app)/login/LoginClient.tsx");

  // hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const errorRef = useRef<string | null>(null); // prevent running useEffect twice

  // states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState<null | "google" | "credentials">(null); // null | "google" | "credentials"
  const [errorModal, setErrorModal] = useState<React.ReactNode | null>(null);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // redirect to /saveToHome if mobile & not standalone
  useEffect(() => {
    const isDesktop = window.matchMedia("(hover: hover) and (pointer:fine)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isDesktop && !isStandalone && process.env.NODE_ENV != "development") {
      router.push("/saveAppToHome");
      return;
    }
  }, []);

  // show error modal if error param is present
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return; // if no error, then exit
    if (errorRef.current === error) return; // prevent re-firing logic twice

    errorRef.current = error;
    setErrorModal(errorMap[error] ?? "Login failed. Please try again.");
    router.replace(pathname); // URL will just show /login
  }, [searchParams, pathname]);

  function validateEmail(email: string) {
    setErrors((prev) => ({ ...prev, email: !!email && !checkEmail(email) }));
  }

  function validatePassword(password: string) {
    setErrors((prev) => ({ ...prev, password: !!password && !checkPassword(password) }));
  }

  async function onSubmitCredentials(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    // if email/password fields blank, then show error modal
    if (!email || !password) {
      setErrorModal("Invalid email or password");
      return;
    }

    // re-validate email & password, as hitting "Enter" does not trigger onBlur
    const _email = email.trim().toLowerCase();
    const isEmailValid = !!_email && checkEmail(_email);
    const isPasswordValid = !!password; // shouldn't check password complexity on login
    setErrors({ email: !isEmailValid, password: !isPasswordValid });
    if (!isEmailValid || !isPasswordValid) {
      setErrorModal("Invalid email or password");
      return;
    }

    setIsLoading("credentials");

    try {
      const res = await signIn("credentials", {
        email: _email,
        password: password,
        redirect: false,
      });
      // if sign in error or success
      if (res?.error) {
        setErrorModal("Invalid email or password");
        setPassword("");
        setIsLoading(null);
      } else {
        window.location.href = "/app/items"; // absence of signInRes.error indicates success
      }
    } catch {
      setErrorModal("Something went wrong. Please try again.");
      setIsLoading(null);
    }
  }

  return (
    <>
      {/*--- Buttons ---*/}
      <div className="w-full flex flex-col gap-[1.5em]" style={{ scrollbarGutter: "stable" }}>
        {/*--- Google Sign In ---*/}
        <SignInButton
          label="Sign in with Google"
          imageSrc="/google.svg"
          imageAlt="google"
          isLoading={isLoading === "google" ? true : false}
          onClick={() => {
            setIsLoading("google");
            signIn("google", { callbackUrl: "/app/items" });
          }}
        />
        {/*--- Credentials Sign In ---*/}
        <div
          className={`${
            showEmailPassword ? "" : "hover:bg-slate-200 dark:hover:bg-slate-300/20 [transition:background-color_200ms] cursor-pointer"
          } w-full textBaseApp font-medium bg-transparent border-[1.5px] border-slate-300 dark:border-slate-400 rounded-[33px] relative`}
        >
          <button
            className="w-full h-[3.5em] flex items-center justify-center gap-[12px] cursor-pointer"
            onClick={() => setShowEmailPassword(!showEmailPassword)}
            type="button"
          >
            <p>Sign in with Email/Password</p>
            {showEmailPassword ? (
              <FaAngleUp className="absolute right-[20px] w-[16px] h-[16px]" />
            ) : (
              <FaAngleDown className="absolute right-[20px] w-[16px] h-[16px]" />
            )}
          </button>
          <Accordion isOpen={showEmailPassword}>
            <form className="px-3 pb-7 w-full flex flex-col" onSubmit={onSubmitCredentials}>
              <InputEmail
                className="mt-2"
                label="Email"
                _id="email"
                isError={errors.email}
                errorMsg="Invalid email"
                onBlur={(e) => validateEmail(e.target.value)}
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                autoComplete="username"
                name="username"
              />
              <InputPassword
                className="py-2"
                label="Password"
                _id="password"
                isError={errors.password}
                errorMsg="Password should contain a lowercase letter, an uppercase letter, and a number"
                onBlur={(e) => validatePassword(e.target.value)}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                autoComplete="current-password"
                name="password"
              />
              <Button className="mt-2" label="Sign In" type="submit" isLoading={isLoading === "credentials" ? true : false} />
              <div className="mt-7 gap-7 w-full flex flex-col items-center">
                <Link className="link underline-animate" href="/new-password">
                  Forgot password?
                </Link>
                <Link className="link underline-animate" href="/signup">
                  Create new account
                </Link>
              </div>
            </form>
          </Accordion>
        </div>
      </div>

      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </>
  );
}
