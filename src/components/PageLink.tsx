import React from 'react'
import { Link, useRouteMatch, generatePath } from 'react-router-dom'

interface PageLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  children: React.ReactNode
}

export function PageLink({ to, children }: PageLinkProps): JSX.Element {
  const { params } = useRouteMatch()
  const path = generatePath(to, params)
  const active = useRouteMatch(to)

  return (
    <Link
      to={path}
      className={`btn btn-sm btn-outline-primary ${active ? 'active' : ''}`}
    >
      {children}
    </Link>
  )
}
