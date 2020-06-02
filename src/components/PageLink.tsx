import React from 'react'
import {
  Link,
  useRouteMatch,
  useLocation,
  generatePath,
} from 'react-router-dom'

interface PageLinkProps {
  to: string
  children: React.ReactNode
}

export function PageLink({ to, children }: PageLinkProps): JSX.Element {
  const location = useLocation()
  const match = useRouteMatch()
  const path = generatePath(to, match.params)
  const active = location.pathname.startsWith(path)

  return (
    <Link
      to={to}
      className={`btn btn-sm btn-outline-primary ${active ? 'active' : ''}`}
    >
      {children}
    </Link>
  )
}
