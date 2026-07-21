import { useState } from 'react'
import { cn } from '../lib/cn'

/**
 * Renders text that toggles into an inline input field when the user is
 * authenticated as admin. The input inherits the exact same typography
 * (font, size, weight, color) from its parent container so it blends
 * seamlessly into the page — the only visual cue is a dashed red border
 * that appears on hover/focus, making editable fields discoverable without
 * cluttering the public-facing design.
 *
 * When `multiline` is true, renders a <textarea> instead of an <input>,
 * useful for longer body text paragraphs.
 */
export function EditableText({
  value,
  onChange,
  isAdmin,
  multiline = false,
  className,
  inputClassName,
  placeholder = 'Click to edit...',
}) {
  const [isEditing, setIsEditing] = useState(false)

  if (!isAdmin) {
    return <span className={className}>{value}</span>
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false)
    }
    if (e.key === 'Enter' && !multiline) {
      setIsEditing(false)
    }
  }

  if (isEditing) {
    const sharedProps = {
      value,
      onChange: (e) => onChange(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      autoFocus: true,
      placeholder,
      className: cn(
        'admin-inline-input w-full',
        inputClassName
      ),
    }

    if (multiline) {
      return <textarea {...sharedProps} rows={3} />
    }
    return <input type="text" {...sharedProps} />
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      onFocus={() => setIsEditing(true)}
      tabIndex={0}
      role="button"
      aria-label={`Click to edit: ${value}`}
      className={cn(
        'admin-editable-outline cursor-pointer',
        className
      )}
    >
      {value || placeholder}
    </span>
  )
}