import Spinner from "@/utils/components/Spinner";
import ItemsShell from "./ItemsShell";
import AddItemButton from "./_components/AddItemButton";

export default function loading() {
  return (
    <ItemsShell addItemButton={<AddItemButton />}>
      <div className="w-full h-full flex items-center justify-center">
        <Spinner />
      </div>
    </ItemsShell>
  );
}
