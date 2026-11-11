import { Plus } from "lucide-react";
import { Button } from "@/utils/components/controls/Button";

export default function AddItemButton({ ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className="absolute z-[3] left-1/2 -translate-x-1/2 bottom-4 touch-none backdrop-blur-xs"
      size="addItem"
      text="Item"
      iconLeft={<Plus className="size-[1.5rem] desktop:size-[1.125rem]" aria-hidden="true" />}
      labelClassName="gap-1.5 textLg"
      aria-label="Add item"
      {...props}
    />
  );
}
