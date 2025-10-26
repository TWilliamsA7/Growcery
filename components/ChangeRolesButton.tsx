// 1. Import the base Button component and its props type
import { Button, buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

// Extend the base ButtonProps to explicitly define our component's props
interface ChangeRolesButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export default function ChangeRolesButton({
  children,
  className,
  ...props
}: ChangeRolesButtonProps) {
  return (
    <Button
      variant="destructive"
      className={cn(
        "w-full sm:w-auto sm:max-w-xs transition-transform transform active:scale-[0.98]",
        className
      )}
      {...props}
    >
      Change Roles
      {children}
    </Button>
  );
}
