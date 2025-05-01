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
      className="w-full h-[56px] desktop:h-[44px] flex gap-[12px] items-center justify-center textBaseApp font-semibold bg-transparent border-[1.5px] border-slate-300 dark:border-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-300/20 [transition:background-color_300ms] cursor-pointer"
    >
      <div className="w-[22px] h-[22px] relative">
        <Image src="./google.svg" alt="google" fill />
      </div>
      <p>{label}</p>
    </button>
  );
}
