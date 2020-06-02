import React from 'react'
import { Link, Switch, Route, Redirect, useRouteMatch } from 'react-router-dom'

import { TrackContributing } from './TrackContributing'
import { TrackMaintaining } from './TrackMaintaining'
import { TrackNewExercise } from './TrackNewExercise'
import { PageLink } from './PageLink'

import {
  ProvideActionable,
  useProvideActionableState,
} from '../hooks/useActionableOnly'

export function TrackTool(): JSX.Element {
  return (
    <ProvideActionable value={useProvideActionableState()}>
      <section>
        <TrackToolHeader />
        <TrackToolPage />
      </section>
    </ProvideActionable>
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
      <PageLink to={`${match.url}/contributing`}>Contributing</PageLink>
      <PageLink to={`${match.url}/maintaining`}>Maintaining</PageLink>
      <PageLink to={`${match.url}/new-exercise`}>New exercise</PageLink>
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
