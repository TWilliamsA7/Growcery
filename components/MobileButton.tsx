// components/MobileFirstButton.tsx

// 1. Import the base Button component and its props type
import { Button, buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

// Extend the base ButtonProps to explicitly define our component's props
interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export default function MobileButton({
  children,
  className,
  ...props
}: MobileButtonProps) {
  return (
    <Button
      // Explicitly set the custom orange variant
      variant="orange"
      // Mobile-First Responsive Styling:
      className={cn(
        "w-full sm:w-auto sm:max-w-xs transition-transform transform active:scale-[0.98]",
        className
      )}
      // Pass all other props (onClick, type, disabled, etc.)
      {...props}
    >
      {children}
    </Button>
  );
}
