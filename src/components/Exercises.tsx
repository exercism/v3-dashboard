import React from 'react'

import { LoadingIndicator } from './LoadingIndicator'
import { Error } from './Error'
import {
  useTracks,
  Track,
  TrackConcept,
  TrackConceptExercise,
} from '../hooks/useTracks'

export function Exercises(): JSX.Element {
  const { result, loading, error } = useTracks()

  if (loading) {
    return <LoadingIndicator />
  }

  if (error) {
    return <Error>There was an error loading the exercises.</Error>
  }

  const tracks = result!.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <section>
      <p>These are all the exercises that been implemented in V3 tracks.</p>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Track</th>
            <th scope="col">Exercise</th>
            <th scope="col">Concepts</th>
            <th scope="col">Prerequisites</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => (
            <TrackExercises key={track.slug} track={track} />
          ))}
        </tbody>
      </table>
    </section>
  )
}

interface TrackExercisesProps {
  track: Track
}

function TrackExercises({ track }: TrackExercisesProps): JSX.Element {
  const exercises = track.exercises.concept.sort((a, b) =>
    a.slug.localeCompare(b.slug)
  )

  return (
    <>
      {exercises.map((exercise) => (
        <tr key={exercise.url}>
          <td>
            <TrackLink track={track} />
          </td>
          <td>
            <ExerciseLink exercise={exercise} />
          </td>
          <td>
            <ConceptLinks concepts={exercise.concepts} />
          </td>
          <td>
            <ConceptLinks concepts={exercise.prerequisites} />
          </td>
        </tr>
      ))}
    </>
  )
}

interface ConceptLinksProps {
  concepts: TrackConcept[]
}

function ConceptLinks({ concepts }: ConceptLinksProps): JSX.Element {
  return (
    <>
      {concepts.map((concept, index) => (
        <span key={index}>
          {index > 0 ? ', ' : ''}
          <ConceptLink concept={concept} />
        </span>
      ))}
    </>
  )
}

interface ConceptLinkProps {
  concept: TrackConcept
}

function ConceptLink({ concept }: ConceptLinkProps): JSX.Element {
  return (
    <a href={concept.url} title={concept.name}>
      {concept.name}
    </a>
  )
}

interface TrackLinkProps {
  track: Track
}

function TrackLink({ track }: TrackLinkProps): JSX.Element {
  return (
    <a href={track.url} title={track.name}>
      {track.name}
    </a>
  )
}

interface ExerciseLinkProps {
  exercise: TrackConceptExercise
}

function ExerciseLink({ exercise }: ExerciseLinkProps): JSX.Element {
  return (
    <a href={exercise.url} title={exercise.slug}>
      {exercise.slug}
    </a>
  )
}
