import React from 'react'
import { useRouteMatch, generatePath, NavLink } from 'react-router-dom'

interface PageLinkProps<T = {}>
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  children: React.ReactNode
  state?: T
}

export function PageLink({ to, children, state }: PageLinkProps): JSX.Element {
  const { params } = useRouteMatch()
  const path = generatePath(to, params)
  const pathWithState = { pathname: path, state: state }

  return (
    <NavLink
      to={pathWithState}
      activeClassName="active"
      className={`btn btn-sm btn-outline-primary`}
    >
      {children}
    </NavLink>
  )
}
