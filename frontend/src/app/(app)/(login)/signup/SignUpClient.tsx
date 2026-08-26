"use client";
// nextjs
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// utils
import { checkEmail, checkPassword, fetchPost } from "@/utils/functions";
import InputEmail from "@/utils/components/InputEmail";
import InputPassword from "@/utils/components/InputPassword";
import ErrorModal from "@/utils/components/simpleModal/ErrorModal";
import Button from "@/utils/components/Button";

export default function SignUpClient() {
  // hooks
  const router = useRouter();

  // states
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState({ email: false, password1: false, password2: false });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function validateEmail(email: string) {
    setErrors((prev) => ({ ...prev, email: !!email && !checkEmail(email) }));
  }

  function validatePassword1(fieldValue: string) {
    setErrors((prev) => ({
      ...prev,
      password1: !!fieldValue && !checkPassword(fieldValue),
      password2: !!password2 && fieldValue !== password2,
    }));
  }

  function validatePassword2(fieldValue: string) {
    setErrors((prev) => ({ ...prev, password2: !!fieldValue && password1 !== fieldValue }));
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return; // prevents calling API twice if users hits "Enter" twice

    // re-validate email & password, as hitting "Enter" does not trigger onBlur
    const _email = email.trim().toLowerCase();
    const isEmailValid = !!_email && checkEmail(_email);
    const isPassword1Valid = !!password1 && checkPassword(password1);
    const isPassword2Valid = !!password2 && password1 === password2;
    setErrors({ email: !isEmailValid, password1: !isPassword1Valid, password2: !isPassword2Valid });
    if (!isEmailValid || !isPassword1Valid || !isPassword2Valid) {
      return;
    }

    setIsLoading(true);

    try {
      const resJson = await fetchPost("/api/createPendingUser", { email: _email, password: password1 });
      if (resJson.status === "success") {
        router.push(`/verify-user?email=${encodeURIComponent(_email)}`);
      } else {
        setErrorMessage(resJson.message || "Server error. Please try again.");
        setIsLoading(false);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || "Server error. Please try again."); // optional chaining is needed
      setIsLoading(false);
    }
  }

  return (
    <>
      {/*--- form ---*/}
      <form className="w-full flex flex-col gap-4" onSubmit={signUp}>
        <InputEmail
          // for InputEmail
          _id="email"
          label="Email"
          isSignIn={false}
          isError={errors.email}
          errorMsg="Invalid email"
          // for Input
          inputSize="login"
          // for <input>
          onBlur={(e) => validateEmail(e.target.value)}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <div className="group relative">
          <InputPassword
            // for InputPassword
            label="Password"
            isCurrentPassword={false}
            name="password"
            isError={errors.password1}
            errorMsg="Must be &ge; 8 characters and contain a lowercase letter, an uppercase letter, and a number"
            // for <input>
            onBlur={(e) => validatePassword1(e.target.value)}
            onChange={(e) => setPassword1(e.target.value)}
            value={password1}
          />
          <div className="absolute right-0 bottom-[calc(100%-1rem)] pointer-events-none p-3 bg-slate-800 textXs space-y-2 roundedButton opacity-0 group-focus-within:opacity-100 [transition:opacity_300ms]">
            <p>&bull;&nbsp; at least 8 characters</p>
            <p>&bull;&nbsp; have a lowercase letter</p>
            <p>&bull;&nbsp; have an uppercase letter</p>
            <p>&bull;&nbsp; have a number</p>
          </div>
        </div>
        <InputPassword
          // for InputPassword
          label="Re-enter Password"
          isCurrentPassword={false}
          name="confirmPassword"
          isError={errors.password2}
          errorMsg="Password does not match"
          // for <input>
          onBlur={(e) => validatePassword2(e.target.value)}
          onChange={(e) => setPassword2(e.target.value)}
          value={password2}
        />
        <Button className="mt-4" label="Sign Up" variant="primary" size="login" type="submit" isLoading={isLoading} disabled={isLoading} />
      </form>

      {/*--- other options ---*/}
      <Link className="mt-14 desktop:mt-12 linkColor underline-animate" href="/login">
        Have an account? Sign in
      </Link>
      {errorMessage && <ErrorModal errorMessage={errorMessage} onClose={() => setErrorMessage("")} />}
    </>
  );
}
