"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
// auth
import { signIn } from "next-auth/react";
// components
import LoginButton from "./_components/LoginButton";
import InputEmail from "@/utils/components/InputEmail";
import InputPassword from "@/utils/components/InputPassword";
import ErrorModal from "@/utils/components/ErrorModal";
import Accordion from "@/utils/components/Accordion";
import Button from "@/utils/components/Button";
// images
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
// utils
import { checkEmail, checkPassword } from "@/utils/functions";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [expandCredentials, setExpandCredentials] = useState(false);

  // show error modal if error searchParam is present
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return; // if no error, then exit
    if (errorRef.current === error) return; // prevent re-firing logic twice

    errorRef.current = error;
    setErrorMessage(errorMap[error] ?? "Login failed. Please try again.");
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
      setErrorMessage("Missing field");
      return;
    }

    // re-validate email & password, as hitting "Enter" does not trigger onBlur
    const _email = email.trim().toLowerCase();
    const isEmailValid = !!_email && checkEmail(_email);
    const isPasswordValid = !!password; // shouldn't check password complexity on login
    setErrors({ email: !isEmailValid, password: !isPasswordValid });
    if (!isEmailValid || !isPasswordValid) {
      setErrorMessage("Invalid email or password");
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
        setPassword("");
        setIsLoading(null);
      } else {
        const token = searchParams.get("token");
        window.location.href = token ? `/invite?token=${encodeURIComponent(token)}` : "/app/items";
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setIsLoading(null);
    }
  }

  return (
    <>
      <div className="w-full flex flex-col items-center gap-6">
        {/*--- Google ---*/}
        <LoginButton
          label="Continue with Google"
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
          className={`w-full loginButtonRoundness loginButtonColor ${
            expandCredentials ? "desktop:hover:!bg-loginButtonBg" : "cursor-pointer"
          }`}
        >
          <button
            className="relative loginButtonBase loginButtonRoundness"
            onClick={() => setExpandCredentials(!expandCredentials)}
            type="button"
          >
            Continue with Email/Password
            {expandCredentials ? <FaAngleUp className="absolute right-6 w-4 h-4" /> : <FaAngleDown className="absolute right-6 w-4 h-4" />}
          </button>
          <Accordion isOpen={expandCredentials}>
            <form className="mt-2 xs:mt-4 px-3 xs:px-5 pb-7 w-full flex flex-col gap-6" onSubmit={onSubmitCredentials} noValidate>
              <InputEmail
                // for InputEmail
                _id="loginEmail"
                placeholder="Enter email"
                isSignIn={true}
                isError={errors.email}
                errorMsg="Invalid email"
                // for Input
                inputVariant={errors.email ? "danger" : "login"}
                inputSize="login"
                // for <input>
                onBlur={(e) => validateEmail(e.target.value)}
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
              <InputPassword
                // for InputPassword
                isLogin={true}
                placeholder="Enter password"
                isCurrentPassword={true}
                name="password"
                isError={errors.password}
                errorMsg="Password should contain a lowercase letter, an uppercase letter, and a number"
                // for <input>
                onBlur={(e) => validatePassword(e.target.value)}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <Button
                className="mt-2"
                label="Sign In"
                variant="primary"
                size="login"
                type="submit"
                isLoading={isLoading === "credentials" ? true : false}
              />
              <div className="mt-7 gap-7 w-full flex flex-col items-center textSm">
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
