import React from 'react'
import { useParams } from 'react-router-dom'

import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { LoadingIndicator } from './LoadingIndicator'

export interface TrackMaintainingParams {
  trackId: TrackIdentifier
}

export function TrackConceptExerciseToImplement(): JSX.Element {
  const { trackId } = useParams<TrackMaintainingParams>()
  const { config, done } = useRemoteConfig(trackId)

  return (
    <div className="d-flex flex-wrap align-items-center mt-4 mb-4 row">
      <div className="col-12 mb-2">
        {done ? <Content config={config} /> : <Loading />}
      </div>
    </div>
  )
}

function Loading(): JSX.Element {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" style={{ background: 0, border: 0 }}>
        <LoadingIndicator />
      </button>
    </div>
  )
}

interface ContentProps {
  config: TrackConfiguration | undefined
}

function Content({ config }: ContentProps): JSX.Element {
  return (
    <>
      <h2>Contributing to {config?.language} </h2>
      <p>
        On this page you'll find various ways in which you'll be able to
        contribute to {config?.language}
      </p>
      <h3>Exercises that need implementing</h3>
      <p>Lorem ipsum</p>
      {/* <ExerciseToImplement>
        <p>So intro about the exercise taken from the issue or autogenerated.
        - Link to issue
        - List of links to exercises on other tracks that have implement the exercise
        <a href="Link to Form">Use this form</a>
        </ExerciseToImplement> */}
    </>
  )
}