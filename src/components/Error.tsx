import React from 'react'

interface ErrorProps {
  children: React.ReactNode
}

export function Error({ children }: ErrorProps): JSX.Element {
  return (
    <div className="alert alert-danger" role="alert">
      {children}
    </div>
  )
}
