import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AnyFieldApi } from "@tanstack/react-form"

interface AdminFormFieldProps {
  field: AnyFieldApi
  label: string
  required?: boolean
  placeholder?: string
  type?: string
  className?: string
  helperText?: React.ReactNode
  children?: React.ReactNode
  onValueChange?: (value: string | number) => void
}

/**
 * Thin wrapper around TanStack Form's field API that renders
 * a Label + Input (or custom children) with error display,
 * following the admin form convention.
 */
export function AdminFormField({
  field,
  label,
  required,
  placeholder,
  type = "text",
  className,
  helperText,
  children,
  onValueChange,
}: AdminFormFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label variant="admin">
        {label}
        {required ? " *" : ""}
      </Label>
      {children ?? (
        <Input
          variant="admin"
          id={field.name}
          name={field.name}
          type={type}
          value={field.state.value as string | number}
          onBlur={field.handleBlur}
          onChange={(e) => {
            const val =
              type === "number" ? Number(e.target.value) : e.target.value
            field.handleChange(val)
            onValueChange?.(val)
          }}
          aria-invalid={isInvalid}
          placeholder={placeholder}
        />
      )}
      {helperText}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </div>
  )
}
