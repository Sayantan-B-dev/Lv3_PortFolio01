import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

function badgeClass(variant: BadgeVariant, extra?: string): string {
  return cn("badge", `badge--${variant}`, extra);
}

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: badgeClass(variant, className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

const badgeVariants = ({ variant = "default" }: { variant?: BadgeVariant } = {}) =>
  badgeClass(variant);

export { Badge, badgeVariants };
