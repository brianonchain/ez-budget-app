"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
// components
import LoginButton from "../_components/LoginButton";
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
  // hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const errorRef = useRef<string | null>(null); // prevent running useEffect twice

  // states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState<null | "google" | "credentials">(null);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // show error modal if error param is present
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return; // if no error, then exit
    if (errorRef.current === error) return; // prevent re-firing logic twice

    errorRef.current = error;
    setErrorMessage(errorMap[error] ?? "Login failed. Please try again.");
    setErrorModal(true);
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
      setErrorMessage("Invalid email or password");
      setErrorModal(true);
      return;
    }

    // re-validate email & password, as hitting "Enter" does not trigger onBlur
    const _email = email.trim().toLowerCase();
    const isEmailValid = !!_email && checkEmail(_email);
    const isPasswordValid = !!password; // shouldn't check password complexity on login
    setErrors({ email: !isEmailValid, password: !isPasswordValid });
    if (!isEmailValid || !isPasswordValid) {
      setErrorMessage("Invalid email or password");
      setErrorModal(true);
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
        setErrorMessage("Invalid email or password");
        setErrorModal(true);
        setPassword("");
        setIsLoading(null);
      } else {
        const token = searchParams.get("token");
        window.location.href = token ? `/invite?token=${encodeURIComponent(token)}` : "/app/items";
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setErrorModal(true);
      setIsLoading(null);
    }
  }

  return (
    <>
      <div className="w-full flex flex-col items-center gap-6">
        {/*--- Google ---*/}
        <LoginButton
          label="Sign in with Google"
          imageSrc="/google.svg"
          imageAlt="google"
          isLoading={isLoading === "google" ? true : false}
          onClick={() => {
            setIsLoading("google");
            const token = searchParams.get("token");
            signIn("google", {
              callbackUrl: token ? `/invite?token=${encodeURIComponent(token)}` : "/app/items",
            });
          }}
        />
        {/*--- Credentials ---*/}
        <div
          className={`w-full loginButtonRoundness ${
            showEmailPassword
              ? "bg-white dark:bg-transparent border border-slate-200 dark:border-slate-400 dark:hover:border-slate-400"
              : "loginButtonColor cursor-pointer"
          }`}
        >
          <button
            className="relative loginButtonBase loginButtonRoundness"
            onClick={() => setShowEmailPassword(!showEmailPassword)}
            type="button"
          >
            <p>Sign in with Email/Password</p>
            {showEmailPassword ? <FaAngleUp className="absolute right-6 w-4 h-4" /> : <FaAngleDown className="absolute right-6 w-4 h-4" />}
          </button>
          <Accordion isOpen={showEmailPassword}>
            <form className="px-3 pb-7 w-full flex flex-col gap-3" onSubmit={onSubmitCredentials}>
              <InputEmail
                className=""
                _id="email"
                label="Email"
                isError={errors.email}
                errorMsg="Invalid email"
                onBlur={(e) => validateEmail(e.target.value)}
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                autoComplete="username"
                name="username"
              />
              <InputPassword
                className=""
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
              <Button
                className="mt-3"
                label="Sign In"
                variant="primary"
                size="base"
                type="submit"
                isLoading={isLoading === "credentials" ? true : false}
              />
              <div className="mt-7 gap-7 w-full flex flex-col items-center">
                <Link className="linkColor underline-animate" href="/new-password">
                  Forgot password?
                </Link>
                <Link className="linkColor underline-animate" href="/signup">
                  Create new account
                </Link>
              </div>
            </form>
          </Accordion>
        </div>
      </div>

      {errorMessage && <ErrorModal errorMessage={errorMessage} setErrorMessage={setErrorMessage} />}
    </>
  );
}
