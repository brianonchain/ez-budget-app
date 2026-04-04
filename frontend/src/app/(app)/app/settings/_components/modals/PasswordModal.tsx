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
import ErrorMessage from "@/utils/components/ErrorMessage";
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
    <Modal title="Change Password" setModal={setPasswordModal} disableCloseButton={status === "pending"}>
      <div className="w-full flex flex-col">
        {status !== "success" ? (
          <form className="" onSubmit={onSubmit}>
            <div className="space-y-4">
              <InputPassword
                // for InputPassword
                _id="oldPassword"
                label="Old Password"
                isCurrentPassword={true}
                name="currentPassword"
                // isError={false} // no error for this field
                // errorMsg="Invalid password" // no error message for this field
                // for Input
                inputSize="base"
                // for <input>
                onChange={(e) => setOldPassword(e.target.value)}
                value={oldPassword}
              />
              <div className="group relative">
                <InputPassword
                  // for InputPassword
                  _id="newPassword1"
                  label="New Password"
                  isCurrentPassword={false}
                  name="newPassword"
                  isError={errors.newPassword1}
                  errorMsg="Must be at least 8 characters and contain a lowercase letter, an uppercase letter, and a number"
                  // for Input
                  inputSize="base"
                  // for <input>
                  onBlur={(e) => validatePassword1(e.target.value)}
                  onChange={(e) => setNewPassword1(e.target.value)}
                  value={newPassword1}
                />
                <div className="absolute right-0 bottom-[calc(100%-16px)] pointer-events-none p-3 bg-slate-800 text-white text-base desktop:text-xs space-y-[8px] rounded-lg opacity-0 group-focus-within:opacity-100 [transition:opacity_300ms]">
                  <p>&bull;&nbsp; at least 8 characters</p>
                  <p>&bull;&nbsp; have a lowercase letter</p>
                  <p>&bull;&nbsp; have an uppercase letter</p>
                  <p>&bull;&nbsp; have a number</p>
                </div>
              </div>
              <InputPassword
                // for InputPassword
                _id="newPassword2"
                label="Re-enter New Password"
                isCurrentPassword={false}
                name="confirmNewPassword"
                isError={errors.newPassword2}
                errorMsg="Password does not match"
                // for Input
                inputSize="base"
                // for <input>
                onBlur={(e) => validatePassword2(e.target.value)}
                onChange={(e) => setNewPassword2(e.target.value)}
                value={newPassword2}
              />
            </div>
            <Button
              className="mt-[40px] w-full"
              label="Change Password"
              variant="primary"
              size="base"
              type="submit"
              isLoading={status === "pending"}
            />
            {errors.submit && <ErrorMessage message={errors.submit} />}
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
