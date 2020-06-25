import React from 'react'
import { useParams, Link } from 'react-router-dom'

import { useRemoteConfig } from '../../hooks/useRemoteConfig'

import { LoadingIndicator } from '../LoadingIndicator'

export interface ExerciseList {
  trackId: TrackIdentifier
}

export function ExerciseList(): JSX.Element {
  const params = useParams<ExerciseList>()

  const { config, done } = useRemoteConfig(params.trackId)

  if (!done) {
    return <LoadingIndicator />
  }

  if (!config?.exercises.concept || config.exercises.concept.length === 0) {
    return (
      <p>
        This track doesn't yet have any exercises. Please check the{' '}
        <Link to={`/${params.trackId}/contributing`}>Contributing</Link> section
        for open issues.
      </p>
    )
  }

  const conceptExercises = [...config.exercises.concept]
  conceptExercises.sort((a, b) => a.slug.localeCompare(b.slug))

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Exercise</th>
          <th scope="col">Concepts</th>
          <th scope="col">Prerequisites</th>
        </tr>
      </thead>
      <tbody>
        {conceptExercises.map((exercise) => (
          <tr key={exercise.uuid}>
            <th scope="row">{exercise.slug} </th>
            <td>{exercise.concepts.join(', ')}</td>
            <td>{exercise.prerequisites.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
