import NoScrollPageGlow from "@/utils/components/NoScrollPageGlow";
import LargeSpinnerAndText from "@/utils/components/LargeSpinnerAndText";

export default function loading() {
  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center items-center bg-bg1">
      <NoScrollPageGlow />
      <LargeSpinnerAndText />
    </div>
  );
}
