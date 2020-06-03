import React, { useCallback, Fragment } from 'react'
import {
  useParams,
  useRouteMatch,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'

import { TrackAside } from './TrackAside'
import { TrackIcon } from './TrackIcon'
import { TrackDescription } from './TrackDescription'
import { PageLink } from './PageLink'
import { SwitchToggle } from './SwitchToggle'

import { ExerciseDetails } from './views/ExerciseDetails'
import { LaunchList } from './views/LaunchList'
import { ExerciseTree } from './views/ExerciseTree'

import { useActionableState } from '../hooks/useActionableOnly'
import { useRemoteConfig } from '../hooks/useRemoteConfig'

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
      <Redirect to={`${match.path}/launch`} />
    </Switch>
  )
}

function TrackMaintainingViewSelect(): JSX.Element {
  const { path }  = useRouteMatch()

  return (
    <div className="btn-group w-100">
      <PageLink to={`${match.url}/launch`}>Launch</PageLink>
      <PageLink to={`${match.url}/tree`}>Tree</PageLink>
    </div>
  )
}
