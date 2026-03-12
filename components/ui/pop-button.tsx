import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Color =
  | "default"
  | "blue"
  | "purple"
  | "green"
  | "orange"
  | "indigo"
  | "violet"
  | "slate";

type SizeVariant = "sm" | "default" | "lg";

export interface PopButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: Color;
  size?: SizeVariant;
  children: React.ReactNode;
  asChild?: boolean;
}

const PopButton = React.forwardRef<HTMLButtonElement, PopButtonProps>(
  (
    { className, color = "default", size = "default", children, asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const baseClasses =
      "font-pop inline-flex select-none transition-all items-center justify-center whitespace-nowrap rounded-xl ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground active:border-b-2 active:scale-y-95 border-x-2 border-t-2 border-b-4 origin-bottom";

    const colors: Record<Color, string> = {
      default:
        "bg-white hover:bg-gray-50 border-neutral-300 text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100",
      blue: "bg-blue-500 hover:bg-blue-600 border-blue-800 text-white",
      purple: "bg-purple-500 hover:bg-purple-600 border-purple-800 text-white",
      green: "bg-green-500 hover:bg-green-600 border-green-800 text-white",
      orange: "bg-orange-500 hover:bg-orange-600 border-orange-800 text-white",
      indigo: "bg-indigo-500 hover:bg-indigo-600 border-indigo-800 text-white",
      violet: "bg-violet-500 hover:bg-violet-600 border-violet-800 text-white",
      slate: "bg-slate-500 hover:bg-slate-600 border-slate-800 text-white",
    };

    const sizes = {
      sm: "h-9 px-2 py-1 text-sm",
      default: "h-10 px-4 py-2",
      lg: "h-14 px-8 py-3 text-lg",
    };

    return (
      <Comp
        ref={ref}
        className={cn(
          baseClasses,
          colors[color],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);

PopButton.displayName = "PopButton";

export { PopButton };
