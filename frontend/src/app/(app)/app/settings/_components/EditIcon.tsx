import Button from "@/utils/components/Button";
import { FiEdit } from "react-icons/fi";

export default function EditIcon({ onClick }: { onClick: () => void }) {
  return (
    <Button
      className="h-12 desktop:h-9 flex items-center gap-2"
      variant="outline"
      size="sm"
      type="button"
      icon={<FiEdit className="" />}
      onClick={onClick}
    />
  );
}
