import { type InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, 'children'> {
  label: string
  as?: 'input' | 'textarea' | 'select'
  options?: { value: string; label: string }[]
  children?: React.ReactNode
}

export function Input({ label, as = 'input', options, className = '', children, ...props }: InputProps) {
  const id = props.name || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      {as === 'textarea' ? (
        <textarea id={id} className="input" {...props as any} />
      ) : as === 'select' ? (
        <select id={id} className="input" {...props as any}>
          {children || (options
            ? [<option key="sel" value="">Select...</option>, ...options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)]
            : <option value="">Select...</option>
          )}
        </select>
      ) : (
        <input id={id} className="input" {...props as any} />
      )}
    </div>
  )
}
