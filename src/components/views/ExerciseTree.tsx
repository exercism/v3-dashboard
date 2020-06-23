import React from 'react'
import { useParams } from 'react-router-dom'

import { useRemoteConfig } from '../../hooks/useRemoteConfig'

import { CheckOrCross } from '../CheckOrCross'
import { LoadingIndicator } from '../LoadingIndicator'
import { ExerciseTreeGraph } from '../graph/ExerciseTreeGraph'

export interface ExerciseTreeParams {
  trackId: TrackIdentifier
}

export function ExerciseTree(): JSX.Element {
  const params = useParams<ExerciseTreeParams>()

  const { config, done } = useRemoteConfig(params.trackId)

  if (!config) {
    return done ? <CheckOrCross value={false} /> : <LoadingIndicator />
  }

  return <ExerciseTreeGraph config={config} />
}
