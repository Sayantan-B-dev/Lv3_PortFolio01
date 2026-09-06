import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";

function buttonClass(variant: ButtonVariant, size: ButtonSize, extra?: string): string {
  const v = variant === "default" ? "btn--default" : `btn--${variant}`;
  const s =
    size === "default"
      ? ""
      : size === "xs"
        ? "btn--xs"
        : size === "sm"
          ? "btn--sm"
          : size === "lg"
            ? "btn--lg"
            : size === "icon"
              ? "btn--icon"
              : size === "icon-xs"
                ? "btn--icon-xs"
                : size === "icon-sm"
                  ? "btn--icon-sm"
                  : "btn--icon-lg";
  return cn("btn", v, s, extra);
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: Omit<ButtonPrimitive.Props, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={buttonClass(variant, size, className)}
      {...props}
    />
  );
}

const buttonVariants = ({ variant = "default", size = "default", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) =>
  buttonClass(variant, size, className);

export { Button, buttonVariants };
