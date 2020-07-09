import React from 'react'
import { useHistory } from 'react-router-dom'

interface BackLinkProps {
  children: React.ReactNode
}

export function BackLink({ children }: BackLinkProps): JSX.Element {
  const history = useHistory()
  const goBack = () => history.goBack()

  return (
    <button className="btn btn-sm btn-outline-danger mr-3" onClick={goBack}>
      {children}
    </button>
  )
}
