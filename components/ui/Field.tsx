import type { ComponentPropsWithoutRef, ReactNode } from "react";

const FIELD =
  "w-full rounded-control border border-line-strong bg-beige/[0.04] px-4 py-3 text-body text-text-primary placeholder:text-text-secondary/80 transition-colors duration-200 hover:border-beige/40 focus:border-beige/60";

type BaseProps = { id: string; label: string };
type InputFieldProps = BaseProps & { multiline?: false } & ComponentPropsWithoutRef<"input">;
type TextareaFieldProps = BaseProps & { multiline: true } & ComponentPropsWithoutRef<"textarea">;

/** Pole formularza z etykietą powiązaną przez id (WCAG 1.3.1 / 3.3.2). */
export default function Field(props: InputFieldProps | TextareaFieldProps) {
  if (props.multiline) {
    const { id, label, multiline: _, className = "", ...rest } = props;
    return (
      <FieldLabel id={id} label={label}>
        <textarea id={id} className={`${FIELD} resize-none ${className}`.trim()} {...rest} />
      </FieldLabel>
    );
  }

  const { id, label, multiline: _, className = "", ...rest } = props;
  return (
    <FieldLabel id={id} label={label}>
      <input id={id} className={`${FIELD} ${className}`.trim()} {...rest} />
    </FieldLabel>
  );
}

function FieldLabel({ id, label, children }: BaseProps & { children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-small text-text-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}
