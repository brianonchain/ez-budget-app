import Image from "next/image";
import Spinner from "@/utils/components/Spinner";

export default function LoginButton({
  isLoading,
  label,
  imageSrc,
  imageAlt,
  onClick,
}: {
  isLoading: boolean;
  label: string;
  imageSrc: string;
  imageAlt: string;
  onClick: () => void;
}) {
  return (
    <button className="relative loginButtonBase loginButtonRoundness loginButtonColor" onClick={onClick} type="button">
      <Image src={imageSrc} alt={imageAlt} width={28} height={28} className="size-7 desktop:size-6" />
      <span>{label}</span>
      {isLoading && <Spinner className="ml-auto" />}
    </button>
  );
}
