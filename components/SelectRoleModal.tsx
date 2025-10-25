import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/contexts/profile-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SelectRoleModalProps {
  title: string;
  description: string;
  openDefault: boolean;
  triggerText: string;
  onOpenChange?: (open: Boolean) => void;
}

export function SelectRoleModal({
  title,
  description,
  openDefault = false,
  triggerText,
  onOpenChange,
}: SelectRoleModalProps) {
  const { updateUserType, profile } = useProfile();
  const router = useRouter();

  return (
    <Dialog defaultOpen={openDefault} onOpenChange={onOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">{triggerText}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="consumer">Consumer</Label>
              <Button
                id="consumer"
                className={`${
                  profile?.user_type === "consumer"
                    ? "border-3 border-amber-600"
                    : ""
                }`}
                onClick={() => {
                  updateUserType("consumer");
                  toast("Updated role to consumer", {
                    description: "Can be changed at an time later on",
                  });
                }}
              >
                Consumer
              </Button>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="farmer">Farmer</Label>
              <Button
                id="farmer"
                className={`${
                  profile?.user_type === "farmer"
                    ? "border-3 border-amber-600"
                    : ""
                }`}
                onClick={() => {
                  updateUserType("farmer");
                  toast("Updated role to farmer", {
                    description: "Can be changed at an time later on",
                  });
                }}
              >
                Farmer
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
