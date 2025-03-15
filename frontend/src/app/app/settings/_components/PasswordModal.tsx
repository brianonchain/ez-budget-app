// nextjs
import { useState, useRef } from "react";
// utils
import { checkPassword, fetchPost } from "@/utils/functions";
// images
import { PiEyeLight, PiEyeSlashLight } from "react-icons/pi";
import { ImSpinner2 } from "react-icons/im";

const defaultErrors = { oldPassword: "", newPassword: "", newPassword2: "", submit: "" };

export default function PasswordModal({ setPasswordModal }: { setPasswordModal: any }) {
  // hooks
  const oldPasswordInputRef = useRef<HTMLInputElement | null>(null); // needed to focus on input when eye is clicked
  const newPasswordInputRef = useRef<HTMLInputElement | null>(null); // needed to focus on input when eye is clicked
  const newPasswordInputRef2 = useRef<HTMLInputElement | null>(null); // needed to focus on input when eye is clicked

  // states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [show, setShow] = useState(false); // eye - show/hide password
  const [show2, setShow2] = useState(false); // eye - show/hide repeat password
  const [show3, setShow3] = useState(false); // eye - show/hide repeat password
  const [errors, setErrors] = useState(defaultErrors);
  const [isSamePassword, setIsSamePassword] = useState(false);
  const [status, setStatus] = useState("initial"); // "initial" | "loading" | "sent"

  async function validatePassword(password: string) {
    if (password) {
      const isPasswordValid = checkPassword(password);
      if (!isPasswordValid) {
        setErrors((errors) => ({ ...errors, newPassword: "Must be at least 8 characters and contain a lowercase letter, an uppercase letter, and a number" }));
        return false;
      }
    }
    setErrors((errors) => ({ ...errors, newPassword: "" }));
    return true; // returns true even if no password because don't want error to show
  }

  function validatePassword2(newPassword: string, newPassword2: string) {
    if (!newPassword2) {
      // don't want to show error if no repeatedPassword
      setIsSamePassword(false);
      setErrors((errors) => ({ ...errors, newPassword2: "" })); // requires to get prevState as validatePassword & validatePassword2 might be run at same time
    } else {
      if (newPassword === newPassword2) {
        setIsSamePassword(true);
        setErrors((errors) => ({ ...errors, newPassword2: "" }));
      } else {
        setIsSamePassword(false);
        setErrors((errors) => ({ ...errors, newPassword2: "Password does not match" }));
      }
    }
  }

  async function onButtonClick() {
    if (status === "sent") {
      setPasswordModal(false);
    } else if (status === "initial") {
      if (!newPassword || !isSamePassword || errors.newPassword || errors.newPassword2) return; // "!password" is needed because no prior validation if password is empty
      setStatus("loading");
      try {
        const resJson = await fetchPost("/api/changePassword", { oldPassword, newPassword });
        console.log(resJson);
        if (resJson === "saved") {
          setErrors(defaultErrors);
          setStatus("sent");
          return;
        } else if (resJson === "unauthorized") {
          setStatus("initial");
          setErrors({ ...errors, submit: "Incorrect password" });
          return;
        }
      } catch (e) {}
      setStatus("initial");
      setErrors({ ...errors, submit: "Server error. Please try again." });
    }
  }

  return (
    <div>
      <div className="modalFull">
        {/*--- close ---*/}
        <div className="xButton" onClick={() => setPasswordModal(false)}>
          &#10005;
        </div>
        {/*--- title ---*/}
        <div className="modalFullHeader">Change Password</div>
        {/*--- content ---*/}
        <div className="modalFullContentContainer">
          {/*--- old password ---*/}
          <p className="mt-[16px] w-full label">Enter current password</p>
          <div className="w-full relative">
            <input
              className={`input peer ${errors.oldPassword ? "!border-red-500 !focus:border-red-500" : ""}`}
              ref={oldPasswordInputRef}
              type={show ? "text" : "password"}
              autoComplete="none"
              autoCapitalize="none"
              onBlur={(e) => setOldPassword(e.target.value)}
              disabled={status === "initial" ? false : true}
            ></input>
            <div
              className="absolute h-full right-4 top-0 flex justify-center items-center desktop:cursor-pointer text-slate-400 peer-focus:text-light-text1 [transition:color_500ms]"
              onClick={() => {
                setShow(!show);
                oldPasswordInputRef.current?.focus();
              }}
            >
              {show ? <PiEyeLight className="text-[24px]" /> : <PiEyeSlashLight className="text-[24px]" />}
            </div>
            {errors.oldPassword && <p className="loginError">{errors.oldPassword}</p>}
          </div>

          {/*--- new passwod 1---*/}
          <div className="mt-[30px] w-full label">Enter new password</div>
          <div className="w-full relative">
            <input
              className={`input peer ${errors.newPassword ? "!border-red-500 !focus:border-red-500" : ""}`}
              ref={newPasswordInputRef}
              type={show2 ? "text" : "password"}
              autoComplete="none"
              autoCapitalize="none"
              onBlur={(e) => {
                setNewPassword(e.target.value);
                validatePassword(e.target.value);
                validatePassword2(e.target.value, newPassword2);
              }}
              disabled={status === "initial" ? false : true}
            ></input>
            <div
              className="absolute h-full right-4 top-0 flex justify-center items-center desktop:cursor-pointer text-slate-400 peer-focus:text-light-text1 [transition:color_500ms]"
              onClick={() => {
                setShow2(!show2);
                newPasswordInputRef.current?.focus();
              }}
            >
              {show2 ? <PiEyeLight className="text-[24px]" /> : <PiEyeSlashLight className="text-[24px]" />}
            </div>
            {errors.newPassword && <p className="loginError">{errors.newPassword}</p>}
          </div>

          {/*--- new passwod 2---*/}
          <div className="mt-[30px] w-full label">Repeat new password</div>
          <div className="w-full relative">
            <input
              className={`input peer ${errors.newPassword2 ? "!border-red-500 !focus:border-red-500" : ""}`}
              ref={newPasswordInputRef2}
              type={show3 ? "text" : "password"}
              autoComplete="none"
              autoCapitalize="none"
              onBlur={(e) => {
                setNewPassword2(e.currentTarget.value);
                validatePassword2(newPassword, e.currentTarget.value);
              }}
              disabled={status === "initial" ? false : true}
            ></input>
            <div
              className="absolute h-full right-4 top-0 flex justify-center items-center desktop:cursor-pointer text-slate-400 peer-focus:text-light-text1 [transition:color_500ms]"
              onClick={() => {
                setShow3(!show3);
                newPasswordInputRef2.current?.focus();
              }}
            >
              {show3 ? <PiEyeLight className="text-[24px]" /> : <PiEyeSlashLight className="text-[24px]" />}
            </div>
            {errors.newPassword2 && <p className="loginError">{errors.newPassword2}</p>}
          </div>

          {/*--- button ---*/}
          <button onClick={onButtonClick} className="mt-[40px] button1 text-lg desktop:text-sm w-full flex justify-center items-center">
            {status === "initial" && <p>Submit</p>}
            {status === "loading" && <ImSpinner2 className="animate-spin text-[28px]" />}
            {status === "sent" && !errors.submit && <p>Close</p>}
          </button>
          {/*--- status message ---*/}
          {errors.submit && <div className="mt-[8px] mb-[40px] text-red-500 text-lg font-medium">{errors.submit}</div>}
          {status === "sent" && !errors.submit && <div className="mt-[8px] mb-[40px] text-green-600 text-lg font-medium">Password successfully changed!</div>}
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
