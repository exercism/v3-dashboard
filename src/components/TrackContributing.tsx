import React from 'react'
import { useParams } from 'react-router-dom'

import {
  useOpenCreationConceptExerciseIssues,
  useOpenImproveConceptExerciseIssues,
  OpenCreationConceptExerciseIssueData,
  OpenImproveConceptExerciseIssueData,
} from '../hooks/useConceptExerciseIssues'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { LoadingIndicator } from './LoadingIndicator'
import { PageLink } from './PageLink'
import { TrackNewExerciseLocationState } from './TrackNewExercise'

export interface TrackContributingParams {
  trackId: TrackIdentifier
}

export function TrackContributing(): JSX.Element {
  const { trackId } = useParams<TrackContributingParams>()
  const { config, done } = useRemoteConfig(trackId)

  return (
    <div className="d-flex flex-wrap align-items-center mt-4 mb-4 row">
      <div className="col-12 mb-2">
        {done ? <Content config={config} trackId={trackId} /> : <Loading />}
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
  trackId: TrackIdentifier
  config: TrackConfiguration | undefined
}

function Content({ trackId, config }: ContentProps): JSX.Element {
  return (
    <>
      <h2>Contributing to {config?.language} </h2>
      <p>
        On this page you&apos;ll find various ways in which you&apos;ll be able
        to contribute to {config?.language}
      </p>
      <OpenCreationConceptExerciseIssues trackId={trackId} />
      <OpenImproveConceptExerciseIssues trackId={trackId} />
    </>
  )
}

interface OpenCreationConceptExerciseIssuesProps {
  trackId: TrackIdentifier
}

function OpenCreationConceptExerciseIssues({
  trackId,
}: OpenCreationConceptExerciseIssuesProps): JSX.Element {
  const { loading, result } = useOpenCreationConceptExerciseIssues(trackId)

  return (
    <>
      <h3>Exercises that need implementing</h3>
      {loading ? (
        <LoadingIndicator>
          Loading new concept exercise issues...
        </LoadingIndicator>
      ) : (
        <>
          {result && result.length > 0 ? (
            <>
              <p>The following exercises are all open to be implemented</p>
              {result.map((issue) => (
                <OpenCreationConceptExerciseIssue
                  key={issue.number}
                  issue={issue}
                  trackId={trackId}
                />
              ))}
            </>
          ) : (
            <p>
              There are no open exercises that need implementing{' '}
              <span role="img" aria-label="party-popper">
                🎉
              </span>
              !
            </p>
          )}
        </>
      )}
    </>
  )
}

interface OpenCreationConceptExerciseIssueProps {
  issue: OpenCreationConceptExerciseIssueData
  trackId: TrackIdentifier
}

function OpenCreationConceptExerciseIssue({
  issue,
  trackId,
}: OpenCreationConceptExerciseIssueProps): JSX.Element {
  const state: TrackNewExerciseLocationState = {
    exerciseName: issue.concept,
    concepts: issue.sections.concepts?.markdown,
    outOfScope: issue.sections.outOfScope?.markdown,
    prerequisites: issue.sections.prerequisites?.markdown,
    learningObjectives: issue.sections.learningObjectives?.markdown,
    issueUrl: issue.url,
  }

  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">{issue.concept}</h5>
        <p className="card-text">
          <small className="text-muted">
            Last updated: {issue.updatedAt.toDateString()}
          </small>
        </p>
        <PageLink to={`/${trackId}/new-exercise`} state={state}>
          Create exercise
        </PageLink>
        <a
          href={issue.url}
          className="card-link btn btn-sm btn-outline-primary ml-2"
        >
          View issue
        </a>
      </div>
    </div>
  )
}

interface OpenImproveConceptExerciseIssuesProps {
  trackId: TrackIdentifier
}

function OpenImproveConceptExerciseIssues({
  trackId,
}: OpenImproveConceptExerciseIssuesProps): JSX.Element {
  const { loading, result } = useOpenImproveConceptExerciseIssues(trackId)

  return (
    <>
      <h3>Exercises that need improving</h3>
      {loading ? (
        <LoadingIndicator>
          Loading improve concept exercise issues...
        </LoadingIndicator>
      ) : (
        <>
          {result && result.length > 0 ? (
            <>
              <p>The following exercises are all open to be improved</p>
              {result.map((issue) => (
                <OpenImproveConceptExerciseIssue
                  key={issue.number}
                  issue={issue}
                />
              ))}
            </>
          ) : (
            <p>
              There are no open exercises that need improving{' '}
              <span role="img" aria-label="party-popper">
                🎉
              </span>
              !
            </p>
          )}
        </>
      )}
    </>
  )
}

interface OpenImproveConceptExerciseIssueProps {
  issue: OpenImproveConceptExerciseIssueData
}

function OpenImproveConceptExerciseIssue({
  issue,
}: OpenImproveConceptExerciseIssueProps): JSX.Element {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">{issue.subject}</h5>
        <p className="card-text">
          <small className="text-muted">
            Last updated: {issue.updatedAt.toDateString()}
          </small>
        </p>
        <a
          href={issue.url}
          className="card-link btn btn-sm btn-outline-primary mr-2"
        >
          View issue
        </a>
      </div>
    </div>
  )
}
