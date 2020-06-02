import React from 'react'
import {
  Link,
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useLocation,
  generatePath,
} from 'react-router-dom'

import { TrackContributing } from './TrackContributing'
import { TrackMaintaining } from './TrackMaintaining'
import { TrackNewExercise } from './TrackNewExercise'

export function TrackTool(): JSX.Element {
  return (
    <section>
      <TrackToolHeader />
      <TrackToolPage />
    </section>
  )
}

function TrackToolHeader(): JSX.Element {
  return (
    <div className="d-flex justify-content-start flex-row align-items-center w-50">
      <SelectDifferentTrackButton />
      <TogglePageButton />
    </div>
  )
}

function TogglePageButton(): JSX.Element {
  const match = useRouteMatch()

  return (
    <div className="btn-group">
      <TrackToolPageLink to={`${match.url}/contributing`}>
        Contributing
      </TrackToolPageLink>
      <TrackToolPageLink to={`${match.url}/maintaining`}>
        Maintaining
      </TrackToolPageLink>
      <TrackToolPageLink to={`${match.url}/new-exercise`}>
        New exercise
      </TrackToolPageLink>
    </div>
  )
}

function SelectDifferentTrackButton(): JSX.Element {
  return (
    <Link to="/" className="btn btn-sm btn-outline-danger mr-3">
      Select different track
    </Link>
  )
}

function TrackToolPage(): JSX.Element {
  const match = useRouteMatch()

  return (
    <Switch>
      <Route
        path={`${match.path}/contributing`}
        component={TrackContributing}
      />
      <Route path={`${match.path}/maintaining`} component={TrackMaintaining} />
      <Route path={`${match.path}/new-exercise`} component={TrackNewExercise} />
      <Redirect to={`${match.path}/contributing`} />
    </Switch>
  )
}

interface TrackToolPageLinkProps {
  to: string
  children: React.ReactNode
}

function TrackToolPageLink({
  to,
  children,
}: TrackToolPageLinkProps): JSX.Element {
  const location = useLocation()
  const match = useRouteMatch()
  const path = generatePath(to, match.params)
  const active = location.pathname == path

  return (
    <Link
      to={to}
      className={`btn btn-sm btn-outline-primary ${active ? 'active' : ''}`}
    >
      {children}
    </Link>
  )
}
