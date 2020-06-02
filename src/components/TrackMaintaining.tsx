import React, { useCallback, Fragment } from 'react'
import {
  useParams,
  useLocation,
  useRouteMatch,
  generatePath,
  Link,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'

import { useActionableState } from '../hooks/useActionableOnly'
import { TrackAside } from './TrackAside'
import { SwitchToggle } from './SwitchToggle'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { TrackIcon } from './TrackIcon'
import { TrackDescription } from './TrackDescription'
import { ExerciseDetails } from './views/ExerciseDetails'
import { LaunchList } from './views/LaunchList'
import { ExerciseTree } from './views/ExerciseTree'
import { TrackContributing } from './TrackContributing'
import { TrackNewExercise } from './TrackNewExercise'

export interface TrackMaintainingParams {
  trackId: TrackIdentifier
}

export function TrackMaintaining(): JSX.Element {
  const params = useParams<TrackMaintainingParams>()

  return (
    <Fragment>
      <div className="d-flex flex-wrap row">
        <div className="col" style={{ maxWidth: '27rem' }}>
          <Header trackId={params.trackId} />
        </div>
        <TrackAside trackId={params.trackId} />
      </div>

      <div className="d-flex flex-wrap align-items-center mt-4 mb-4 row">
        <div className="col-12 col-md-auto mb-2">
          <TrackMaintainingViewSelect />
        </div>
        <div className="col mb-2">
          <SwitchActionableState />
        </div>
      </div>

      <TrackView />
    </Fragment>
  )
}

interface HeaderProps {
  trackId: TrackIdentifier
}

function Header({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const { config, done } = useRemoteConfig(trackId)

  return (
    <header
      className="card mt-4 mb-4"
      style={{ maxWidth: '25rem', width: '100%' }}
    >
      <figure style={{ maxWidth: 234, padding: '0 10px', margin: '10px auto' }}>
        <TrackIcon className="card-img-top" trackId={trackId} />
      </figure>
      <h1 className="sr-only card-title">{trackId}</h1>
      {done && (
        <div className="card-body">
          <TrackDescription config={config} />
        </div>
      )}
    </header>
  )
}

// const DEFAULT_VIEW = 'launch'

function SwitchActionableState(): JSX.Element {
  const [current, onChange] = useActionableState()

  const doToggle = useCallback(() => onChange((prev) => !prev), [onChange])

  return (
    <SwitchToggle
      inActiveLabel="All"
      activeLabel="Actionable"
      onToggle={doToggle}
      actionableOnly={current}
    />
  )
}

function TrackView(): JSX.Element | null {
  const match = useRouteMatch()

  return (
    <Switch>
      <Route path={`${match.path}/details`} component={ExerciseDetails} />
      <Route path={`${match.path}/launch`} component={LaunchList} />
      <Route path={`${match.path}/tree`} component={ExerciseTree} />
    </Switch>
  )
}

interface TrackViewPageLinkProps {
  to: string
  children: React.ReactNode
}

function TrackMaintainingViewSelect(): JSX.Element {
  const match = useRouteMatch()

  return (
    <div className="btn-group w-100">
      <TrackMaintainingViewLink to={`${match.url}/launch`}>
        Launch
      </TrackMaintainingViewLink>
      <TrackMaintainingViewLink to={`${match.url}/tree`}>
        Tree
      </TrackMaintainingViewLink>
    </div>
  )
}

function TrackMaintainingViewLink({
  to,
  children,
}: TrackViewPageLinkProps): JSX.Element {
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
