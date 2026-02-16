import { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
// utils
import { checkPassword, fetchPost } from "@/utils/functions";
import InputPassword from "@/utils/components/InputPassword";
import { FaCircleCheck } from "react-icons/fa6";
import { signOut } from "next-auth/react";
// components
import Button from "@/utils/components/Button";
import Modal from "@/utils/components/Modal";

const defaultErrors = { newPassword1: false, newPassword2: false, submit: "" };

export default function PasswordModal({ setPasswordModal, email }: { setPasswordModal: any; email: string }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [errors, setErrors] = useState(defaultErrors);
  const [isSamePassword, setIsSamePassword] = useState(false);
  const [status, setStatus] = useState("initial"); // "initial" | "pending" | "success"
  const [isLoading, setIsLoading] = useState(false);

  function validatePassword1(fieldValue: string) {
    setErrors((prev) => ({
      ...prev,
      newPassword1: !!fieldValue && !checkPassword(fieldValue),
      newPassword2: !!newPassword2 && fieldValue !== newPassword2,
    }));
  }

  function validatePassword2(fieldValue: string) {
    setErrors((prev) => ({ ...prev, newPassword2: !!fieldValue && newPassword1 !== fieldValue }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "initial") return; // prevents calling API twice if users hits "Enter" twice

    // re-validate email & password, as hitting "Enter" does not trigger onBlur
    const isNewPassword1Valid = !!newPassword1 && checkPassword(newPassword1);
    const isNewPassword2Valid = !!newPassword2 && newPassword1 === newPassword2;
    setErrors({ newPassword1: !isNewPassword1Valid, newPassword2: !isNewPassword2Valid, submit: "" });
    if (!isNewPassword1Valid || !isNewPassword2Valid) {
      return;
    }

    setStatus("pending");

    try {
      const resJson = await fetchPost("/api/changePassword", { oldPassword, newPassword: newPassword1 });
      if (resJson.status === "success") {
        setErrors(defaultErrors); // may not be needed but just in case
        setStatus("success");
      } else {
        setErrors((prev) => ({ ...prev, submit: resJson.message }));
        setStatus("initial");
      }
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, submit: e?.message || "Server error. Please try again." }));
      setStatus("initial");
    }
  }

  return (
    <Modal title="Change Password" setIsOpen={setPasswordModal} disableCloseButton={status === "pending"}>
      <div className="w-full inputMaxWidth h-[410px]">
        {status !== "success" ? (
          <form className="" onSubmit={onSubmit}>
            <div className="space-y-4">
              <InputPassword
                _id="oldPassword"
                className=""
                label="Old Password"
                onChange={(e) => setOldPassword(e.target.value)}
                value={oldPassword}
                autoComplete="current-password"
                disabled={status === "initial" ? false : true}
              />
              <div className="group relative">
                <InputPassword
                  _id="newPassword1"
                  className=""
                  label="New Password"
                  isError={errors.newPassword1}
                  errorMsg="Must be at least 8 characters and contain a lowercase letter, an uppercase letter, and a number"
                  onBlur={(e) => validatePassword1(e.target.value)}
                  onChange={(e) => setNewPassword1(e.target.value)}
                  value={newPassword1}
                  autoComplete="new-password"
                  disabled={status === "initial" ? false : true}
                />
                <div className="absolute right-0 bottom-[calc(100%-16px)] pointer-events-none p-3 bg-slate-800 text-white text-base desktop:text-xs space-y-[8px] rounded-lg opacity-0 group-focus-within:opacity-100 [transition:opacity_300ms]">
                  <p>&bull;&nbsp; at least 8 characters</p>
                  <p>&bull;&nbsp; have a lowercase letter</p>
                  <p>&bull;&nbsp; have an uppercase letter</p>
                  <p>&bull;&nbsp; have a number</p>
                </div>
              </div>
              <InputPassword
                _id="newPassword2"
                className=""
                label="Re-enter New Password"
                isError={errors.newPassword2}
                errorMsg="Password does not match"
                onBlur={(e) => validatePassword2(e.target.value)}
                onChange={(e) => setNewPassword2(e.target.value)}
                value={newPassword2}
                autoComplete="new-password"
                disabled={status === "initial" ? false : true}
              />
            </div>
            <Button
              className="mt-[40px]"
              label="Change Password"
              type="submit"
              isLoading={status === "pending"}
              disabled={status !== "initial"}
            />
            {errors.submit && <div className="mt-[32px] text-red-500 font-medium text-center">{errors.submit}</div>}
          </form>
        ) : (
          <div className="w-full h-[300px] desktop:h-[240px] flex flex-col items-center justify-center gap-[32px] font-medium text-center">
            <FaCircleCheck className="text-[40px] desktop:text-[40px] text-green-500" />
            <p>Password successfully changed!</p>
            <p>You may close this window.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
