import Spinner from "@/utils/components/Spinner";
import Card from "@/utils/components/Card";
import TextSkeleton from "@/utils/components/TextSkeleton";

export default function loading() {
  return (
    <div className="w-full pageContentMaxWidth py-4 portrait:sm:py-6 landscape:lg:py-6 flex flex-col items-center gap-4">
      <Card className="relative flex flex-col items-center">
        <div className="font-semibold text-textSecondary">Discretionary Budget</div>
        <TextSkeleton className="mt-3 textXl font-semibold w-40" />
        <TextSkeleton className="mt-1 textXs w-40" />
      </Card>
      <Card className="flex flex-col items-center">
        <div className="w-full h-100 flex items-center justify-center">
          <Spinner />
        </div>
      </Card>
    </div>
  );
}
