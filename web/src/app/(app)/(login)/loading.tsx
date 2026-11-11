import LargeSpinnerAndText from "@/utils/components/LargeSpinnerAndText";

export default function loading() {
  return (
    <div className="h-70 flex flex-col items-center justify-center">
      <LargeSpinnerAndText />
    </div>
  );
}
