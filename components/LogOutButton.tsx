// 1. Import the base Button component and its props type
import { Button, buttonVariants } from "@/components/ui/button";
import { logoutAction } from "@/lib/supabase/auth";

import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Extend the base ButtonProps to explicitly define our component's props
interface LogOutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export default function LogOutButton({
  children,
  className,
  ...props
}: LogOutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const succ: Boolean = await logoutAction();
    if (succ) {
      router.push("/login");
    } else {
      toast("Error Signing Out!");
      console.error("Error running log out function");
    }
  };

  return (
    <Button
      // Explicitly set the custom orange variant
      variant="destructive"
      // LogOut-First Responsive Styling:
      className={cn(
        "w-full sm:w-auto sm:max-w-xs transition-transform transform active:scale-[0.98]",
        className
      )}
      onClick={handleLogout}
      // Pass all other props (onClick, type, disabled, etc.)
      {...props}
    >
      Log Out
      {children}
    </Button>
  );
}
