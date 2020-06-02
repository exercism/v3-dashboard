import React, { useCallback } from 'react'

interface PageSelectLinkProps {
  page: Page
  children: React.ReactNode
}
export function PageSelectLink({
  page,
  children,
}: PageSelectLinkProps): JSX.Element {
  return <p>Page select link</p>
  // const [actualPage, onChangePage] = usePage()
  // const { href } = useUrl({ page })

  // const doChangePage = useCallback(
  //   (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  //     e.preventDefault()
  //     onChangePage(page)
  //   },
  //   [page, onChangePage]
  // )

  // const active = page === actualPage

  // return (
  //   <a
  //     className={`btn btn-sm btn-outline-primary ${active ? 'active' : ''}`}
  //     onClick={doChangePage}
  //     href={href}
  //   >
  //     {children}
  //   </a>
  // )
}
