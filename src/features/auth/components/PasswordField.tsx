import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { IconButton } from '@/components/ui'
import { Input, type InputProps } from '@/components/ui/Input'

/**
 * A password input with a reveal toggle.
 *
 * Two details that are easy to get wrong: the toggle is a real `<button>` with
 * a label that changes with state (so a screen reader announces "Show
 * password" / "Hide password" rather than an unnamed icon), and it is
 * `tabIndex={-1}`-free — it belongs in the tab order, because someone
 * navigating by keyboard is exactly who needs to check what they typed.
 */

interface PasswordFieldProps extends Omit<InputProps, 'type' | 'trailing'> {
  /** Rendered under the field — the strength meter on signup and reset. */
  footer?: React.ReactNode
}

export function PasswordField({ footer, autoComplete, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const describeId = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete ?? 'current-password'}
        // Managers and browsers behave better when this is explicit.
        spellCheck={false}
        autoCapitalize="off"
        trailing={
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            aria-describedby={describeId}
            onClick={() => setVisible((v) => !v)}
            icon={visible ? <EyeOff /> : <Eye />}
          />
        }
      />
      <span id={describeId} className="sr-only">
        Toggles whether your password is shown as plain text.
      </span>
      {footer}
    </div>
  )
}
