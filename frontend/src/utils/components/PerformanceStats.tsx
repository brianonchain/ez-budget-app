import { useLoadTime } from "@/utils/hooks";

export default function PerformanceStats({ isItemsData, isWorkspaceData }: { isItemsData: boolean; isWorkspaceData: boolean }) {
  const itemsTime = useLoadTime(isItemsData);
  const settingsTime = useLoadTime(isWorkspaceData);

  return (
    <div className="fixed bottom-50 right-3 z-50 roundedButton bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-sm space-y-1 pointer-events-none">
      <div>Items: {itemsTime?.toFixed(0) ?? "NA"} ms</div>
      <div>Settings: {settingsTime?.toFixed(0) ?? "NA"} ms</div>
    </div>
  );
}
