import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Card({ title, children, actions, className = '', style }: CardProps) {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || actions) && (
        <div className="card-header">
          {title && <div className="card-title">{title}</div>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
