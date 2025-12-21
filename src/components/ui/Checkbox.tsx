import { forwardRef } from "react";
import { cn } from "../../lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <label className="inline-flex items-center gap-2 text-sm text-ink-700">
      <input
        ref={ref}
        type="checkbox"
        className={cn("h-4 w-4 rounded border-ink-300 text-brand-600", className)}
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </label>
  )
);

Checkbox.displayName = "Checkbox";
