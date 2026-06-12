import { useCallback, type ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'accent'
  size?: 'default' | 'sm'
  to?: string
}

export function Button({ variant = 'default', size = 'default', to, className = '', children, ...props }: ButtonProps) {
  const cls = `btn ${variant !== 'default' ? `btn-${variant}` : ''} ${size !== 'default' ? `btn-${size}` : ''} ${className}`.trim()

  if (to) {
    return <Link to={to} className={cls}>{children}</Link>
  }

  return <button className={cls} {...props}>{children}</button>
}
