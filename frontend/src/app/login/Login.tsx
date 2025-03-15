"use client";
// nextjs
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// utils
import { checkEmail, checkPassword, fetchPost } from "@/utils/functions";
// images
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import { ImSpinner2 } from "react-icons/im";
import ErrorModal from "@/utils/components/ErrorModal";

export default function Login() {
  console.log("(app)/login/_components/Login.tsx");

  // hooks
  const router = useRouter();
  const passwordInputRef = useRef<HTMLInputElement | null>(null); // needed to focus on input when eye is clicked
  const passwordInputRef2 = useRef<HTMLInputElement | null>(null); // needed to focus on input when eye is clicked

  // states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [show, setShow] = useState(false); // eye - show/hide password
  const [show2, setShow2] = useState(false); // eye - show/hide repeat password
  const [errors, setErrors] = useState({ email: "", password: "", password2: "" });
  const [isSamePassword, setIsSamePassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
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

  async function login() {
    if (!email || !password || errors.email || errors.password) return; // !email || !password needed because no prior validation if email/password is empty
    setIsLoading(true);
    try {
      const resJson = await fetchPost("/api/login", { email, password });
      console.log("resJson", resJson);
      if (resJson === "success") {
        console.log("login authenticated, pushed to /app");
        router.push("/app");
      } else if (resJson === "unauthorized") {
        setErrorModal("Incorrect email or password");
      } else if (resJson === "no user") {
        setErrorModal("Email is not registered");
      } else {
        console.log("this");
        setErrorModal("Server error");
      }
    } catch (e) {
      console.log("that");

      setErrorModal("Server error");
    }
    setIsLoading(false);
    setPassword("");
  }

  async function signUp() {
    if (!email || !password || !isSamePassword || errors.email || errors.password || errors.password2) return; // "!email || !password" is needed because no prior validation if email/password is empty
    setIsLoading(true);
    // create new user & get jwt
    try {
      const resJson = await fetchPost("/api/createUser", { email, password });
      if (resJson === "success") {
        console.log("user created, pushed to /app");
        router.push("/app");
      } else if (resJson === "Email already exists") {
        setErrorModal("Email already exists");
      } else {
        setErrorModal("Server error");
      }
    } catch (e) {
      setErrorModal("Server error");
    }
    setIsLoading(false);
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center overflow-y-auto bg-light-bg1 text-light-text1 text-lg desktop:text-sm">
      {/*--- content container (fits motto length) ---*/}
      <div className="pt-[30px] pb-[50px] w-[350px] desktop:w-[290px] flex flex-col items-center gap-[50px] desktop:gap-[40px]">
        {/*--- logo ---*/}
        <div className="w-[calc(100%-4px)] flex flex-col items-center">
          <div className="w-full h-[66px] desktop:h-[60px] relative">
            <Image src="/logo.svg" alt="logo" fill />
          </div>
          <p className="text-base desktop:text-sm">Track expenses with minimal keystrokes</p>
        </div>

        {/*--- form ---*/}
        <form className="w-full flex flex-col gap-[30px] desktop:gap-[28px]">
          {/*--email---*/}
          <div className="flex flex-col relative">
            <div className="label">Email</div>
            <input
              className={`input ${errors.email ? "!border-red-500 !focus:border-red-500" : ""}`}
              type="email"
              onBlur={(e) => validateEmail(e.target.value)}
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            ></input>
            {errors.email && <p className="loginError">{errors.email}</p>}
          </div>
          {/*--password---*/}
          <div>
            <div className="label">Password</div>
            <div className="w-full relative">
              <input
                className={`input peer ${errors.password ? "!border-red-500 !focus:border-red-500" : ""}`}
                ref={passwordInputRef}
                type={show ? "text" : "password"}
                autoComplete="none"
                autoCapitalize="none"
                onBlur={() => {
                  validatePassword();
                  if (isSignUp) validatePassword2();
                }}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              ></input>
              <div
                className="absolute h-full right-4 top-0 flex justify-center items-center desktop:cursor-pointer text-slate-400 peer-focus:text-light-text1 [transition:color_500ms]"
                onClick={() => {
                  setShow(!show);
                  passwordInputRef.current?.focus();
                }}
              >
                {show ? <PiEyeLight className="text-[24px]" /> : <PiEyeSlashLight className="text-[24px]" />}
              </div>
              {errors.password && <p className="loginError">{errors.password}</p>}
            </div>
          </div>
          {/*--- password2 ---*/}
          {isSignUp && (
            <div>
              <div className="label">Retype Password</div>
              <div className="w-full relative">
                <input
                  className={`input peer ${errors.password2 ? "!border-red-500 !focus:border-red-500" : ""}`}
                  ref={passwordInputRef2}
                  type={show2 ? "text" : "password"}
                  autoComplete="none"
                  autoCapitalize="none"
                  onBlur={() => validatePassword2()}
                  onChange={(e) => setPassword2(e.target.value)}
                  value={password2}
                ></input>
                <div
                  className="absolute h-full right-4 top-0 flex justify-center items-center desktop:cursor-pointer text-slate-400 peer-focus:text-light-text1 [transition:color_500ms]"
                  onClick={() => {
                    setShow2(!show2);
                    passwordInputRef2.current?.focus();
                  }}
                >
                  {show2 ? <PiEyeLight className="text-[24px]" /> : <PiEyeSlashLight className="text-[24px]" />}
                </div>
                {errors.password2 && <p className="loginError">{errors.password2}</p>}
              </div>
            </div>
          )}
          {/*--- button ---*/}
          <button className="mt-[20px] loginButton w-full" type="button" disabled={isLoading} onClick={isSignUp ? signUp : login}>
            {isLoading ? <ImSpinner2 className="animate-spin text-[24px]" /> : <p>{isSignUp ? "Sign Up" : "Login"}</p>}
          </button>
        </form>

        {/*--- other options ---*/}
        <div className="w-full flex flex-col gap-[40px] desktop:gap-[30px] items-center textSmApp">
          <div
            className="link"
            onClick={() => {
              setEmail("");
              setPassword("");
              setPassword2("");
              setErrors({ email: "", password: "", password2: "" });
              setIsSignUp(!isSignUp);
            }}
          >
            {isSignUp ? "Already a user? Login" : "Sign Up"}
          </div>
          <div className="link" onClick={() => router.push("/new-password")}>
            Forget password?
          </div>
        </div>
      </div>
      {errorModal && <ErrorModal errorModal={errorModal} setErrorModal={setErrorModal} />}
    </div>
  );
}
