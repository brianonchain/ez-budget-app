import { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
// utils
import { checkPassword, fetchPost } from "@/utils/functions";
import InputPassword from "@/utils/components/InputPassword";
import { FaCircleCheck } from "react-icons/fa6";

const defaultErrors = { newPassword1: "", newPassword2: "", submit: "" };

export default function PasswordModal({ setPasswordModal, email }: { setPasswordModal: any; email: string }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [errors, setErrors] = useState(defaultErrors);
  const [isSamePassword, setIsSamePassword] = useState(false);
  const [status, setStatus] = useState("initial"); // "initial" | "loading" | "sent"

  async function validatePassword1(_newPassword: string) {
    if (_newPassword) {
      const isPasswordValid = checkPassword(_newPassword);
      if (!isPasswordValid) {
        setErrors((errors) => ({ ...errors, newPassword1: "Must be at least 8 characters and contain a lowercase letter, an uppercase letter, and a number" }));
        return false;
      }
    }
    setErrors((errors) => ({ ...errors, newPassword1: "" }));
    return true; // returns true even if no password because don't want error to show
  }

  function validatePassword2(_newPassword: string, _newPassword2: string) {
    if (!_newPassword2) {
      // don't want to show error if no newPassword2
      setIsSamePassword(false);
      setErrors((errors) => ({ ...errors, newPassword2: "" })); // requires prevState as validatePassword1 & validatePassword2 runs at same time at newPassword1 input onBlur
    } else {
      if (_newPassword === _newPassword2) {
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
      if (!newPassword1 || !newPassword2 || !isSamePassword || errors.newPassword1 || errors.newPassword2) return; // !newPassword1/!newPassword2 needed because no prior validation
      setStatus("loading");
      try {
        const resJson = await fetchPost("/api/changePassword", { oldPassword, newPassword: newPassword1 });
        if (resJson.status === "success") {
          setErrors(defaultErrors);
          setStatus("sent");
          setNewPassword1("");
          setNewPassword2("");
          setOldPassword("");
          return;
        } else if (resJson.status === "error") {
          setErrors({ ...errors, submit: resJson.message });
          setStatus("initial");
          return;
        }
      } catch (e) {}
      setErrors({ ...errors, submit: "Server error. Please try again." });
      setStatus("initial");
    }
  }

  return (
    <div>
      <div className="modalFull">
        {/*--- glow ---*/}
        <div className="absolute w-full h-full left-0 top-0 bg-gradient-to-br from-lightBg1 to-lightBg1 dark:from-blue-500/20 dark:to-blue-500/10 z-[-1]"></div>
        {/*--- close ---*/}
        <div className="xButton" onClick={() => setPasswordModal(false)}>
          &#10005;
        </div>
        {/*--- title ---*/}
        <div className="modalFullHeader">Change Password</div>
        {/*--- content ---*/}
        <div className="modalFullContentContainer">
          <div className="mx-auto pt-[24px] w-full max-w-[380px] desktop:!max-w-[300px]">
            {status != "sent" ? (
              <div className="w-full h-[300px] desktop:h-[240px] space-y-[23px]">
                {/*--- hidden email input ---*/}
                {/* <input className="absolute left-[9999px] w-[1px] h-[1px]" type="text" name="username" autoComplete="username" value={email} readOnly /> */}
                <InputPassword
                  className=""
                  label="Old Password"
                  onChange={(e) => setOldPassword(e.target.value)}
                  value={oldPassword}
                  autoComplete="current-password"
                  disabled={status === "initial" ? false : true}
                />
                <InputPassword
                  className=""
                  label="New Password"
                  tooltip={true}
                  error={errors.newPassword1}
                  onBlur={(e) => validatePassword1(e.target.value)}
                  onChange={(e) => setNewPassword1(e.target.value)}
                  value={newPassword1}
                  autoComplete="new-password"
                  disabled={status === "initial" ? false : true}
                />
                <InputPassword
                  className=""
                  label="Re-enter New Password"
                  error={errors.newPassword2}
                  onBlur={(e) => validatePassword2(newPassword1, e.target.value)}
                  onChange={(e) => setNewPassword2(e.target.value)}
                  value={newPassword2}
                  autoComplete="new-password"
                  disabled={status === "initial" ? false : true}
                />
              </div>
            ) : (
              <div className="w-full h-[300px] desktop:h-[240px] flex items-center justify-center gap-[6px] font-medium">
                <FaCircleCheck className="text-[20px] desktop:text-[18px] text-green-500" />
                Password successfully changed!
              </div>
            )}
            {/*--- button ---*/}
            <button onClick={onButtonClick} className="button1 mt-[40px] w-full flex justify-center items-center" type="button">
              {status === "initial" && <p>Submit</p>}
              {status === "loading" && <ImSpinner2 className="animate-spin text-[32px] desktop:text-[24px]" />}
              {status === "sent" && !errors.submit && <p>Close</p>}
            </button>
            {/*--- error message ---*/}
            {errors.submit && <div className="mt-[8px] mb-[40px] text-red-500 font-medium">{errors.submit}</div>}
          </div>
        </div>
      </div>
      <div className="modalBlackout"></div>
    </div>
  );
}
