import React from 'react'
import { NavLink } from 'react-router-dom'

export function Header(): JSX.Element {
  return (
    <header className="p-3 mb-2" style={{ background: '#009cab' }}>
      <HeaderLink to="/">
        <HeaderLogo />
      </HeaderLink>
      <HeaderLink to="/">Tracks</HeaderLink>
      <HeaderLink to="/stories">Stories</HeaderLink>
    </header>
  )
}

function HeaderLogo(): JSX.Element {
  return (
    <img
      alt="Exercism"
      src="https://assets.exercism.io/assets/logo-white-e3be059a4bfc4bf65f196a12105e9cff389b5a67f2065a0862d4ff6153571ef5.png"
      className="float-left"
      height="24px"
    />
  )
}

interface HeaderLinkProps {
  children: React.ReactNode
  to: string
}

function HeaderLink({ children, to }: HeaderLinkProps): JSX.Element {
  return (
    <NavLink to={to} className="text-white mr-3">
      {children}
    </NavLink>
  )
}
