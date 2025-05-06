import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignInGoogle({ label }: { label: string }) {
  const router = useRouter();

  async function signInWithGoogle() {
    // setIsLoading("email");
    var res = await signIn("google", {
      callbackUrl: "/app/items",
      prompt: "select_account", // doesn't seem to work
    });
    // if sign in error or success
    if (res?.error) {
      // setIsLoading(null);
    } else if (res?.url) {
      router.push(res.url);
    }
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="w-full h-[3.2em] flex items-center justify-center gap-4 textBaseApp font-medium bg-transparent hover:bg-slate-200 dark:hover:bg-slate-300/20 border-[1.5px] border-slate-300 dark:border-slate-400 rounded-full [transition:background-color_300ms] cursor-pointer"
    >
      <div className="w-7 h-7 desktop:w-5 desktotp:h-5 relative">
        <Image src="./google.svg" alt="google" fill />
      </div>
      <p>{label}</p>
    </button>
  );
}
