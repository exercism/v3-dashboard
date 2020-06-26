import React from 'react'
import { useParams, Link } from 'react-router-dom'

import { useRemoteConfig } from '../../hooks/useRemoteConfig'

import { LoadingIndicator } from '../LoadingIndicator'
import { useConcepts, Concept as ConceptData } from '../../hooks/useConcepts'

export interface ExerciseList {
  trackId: TrackIdentifier
}

export function ExerciseList(): JSX.Element {
  const params = useParams<ExerciseList>()
  const { result: conceptsResult, loading: conceptsLoading } = useConcepts()

  const { config, done } = useRemoteConfig(params.trackId)

  if (!done || conceptsLoading) {
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
        <ExerciseRows
          exercises={config.exercises.concept}
          conceptData={conceptsResult || []}
        />
      </tbody>
    </table>
  )
}

interface ExerciseRowsProps {
  exercises: readonly ExerciseConfiguration[]
  conceptData: readonly ConceptData[]
}

function ExerciseRows({
  exercises,
  conceptData: concepts,
}: ExerciseRowsProps): JSX.Element {
  const sortedExercises = [...exercises]
  sortedExercises.sort((a, b) => a.slug.localeCompare(b.slug))

  return (
    <>
      {sortedExercises.map((exercise) => (
        <tr key={exercise.uuid}>
          <th scope="row">{exercise.slug} </th>
          <td>
            <Concepts concepts={exercise.concepts} conceptData={concepts} />
          </td>
          <td>
            <Concepts
              concepts={exercise.prerequisites}
              conceptData={concepts}
            />
          </td>
        </tr>
      ))}
    </>
  )
}

interface ConceptsProps {
  concepts: readonly string[]
  conceptData: readonly ConceptData[]
}

function Concepts({ concepts, conceptData }: ConceptsProps): JSX.Element {
  const findConcept = (concept: string) =>
    conceptData.find((data) => data.variations.includes(concept))

  return (
    <>
      {concepts.map((concept, index) => (
        <span key={index}>
          {index > 0 ? ', ' : ''}
          <Concept concept={concept} data={findConcept(concept)} />
        </span>
      ))}
    </>
  )
}

interface ConceptProps {
  concept: string
  data: ConceptData | undefined
}

function Concept({ concept, data }: ConceptProps): JSX.Element {
  if (data) {
    return <a href={data.url}>{concept}</a>
  }

  return <>{concept}</>
}
