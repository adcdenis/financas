import { forwardRef } from "react";
import { cn } from "../../lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 shadow-sm",
      "placeholder:text-ink-400 input-ring",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
