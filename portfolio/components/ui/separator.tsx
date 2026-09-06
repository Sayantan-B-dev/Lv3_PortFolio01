"use client";

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";
import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: Omit<SeparatorPrimitive.Props, "className"> & { className?: string }) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "separator",
        orientation === "horizontal" ? "separator--horizontal" : "separator--vertical",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
