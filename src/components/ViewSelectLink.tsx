import React, { useCallback } from 'react'

// import { useView, useUrl } from '../hooks/useUrlState'

interface ViewSelectLinkProps {
  view: View
  children: React.ReactNode
}
export function ViewSelectLink({
  view,
  children,
}: ViewSelectLinkProps): JSX.Element {
  // const [actualView, onChangeView] = useView()
  // const { href } = useUrl({ view })

  // const doChangeView = useCallback(
  //   (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  //     e.preventDefault()
  //     onChangeView(view)
  //   },
  //   [view, onChangeView]
  // )

  // const active = view === actualView
  const active = false

  return (
    <a
      className={`btn btn-sm btn-outline-primary ${active ? 'active' : ''}`}
      // onClick={doChangeView}
      // href={href}
    >
      {children}
    </a>
  )
}
