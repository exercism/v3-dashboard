/// <reference path="../declarations.d.ts" />

import marked from 'marked'
import React, { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import {
  useNewConceptExerciseIssues,
  NewConceptExerciseIssue,
} from '../hooks/useNewConceptExerciseIssues'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { LoadingIndicator } from './LoadingIndicator'
import { PageLink } from './PageLink'

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
  const asyncNewConceptExerciseIssues = useNewConceptExerciseIssues(trackId)

  return (
    <>
      <h2>Contributing to {config?.language} </h2>
      <p>
        On this page you'll find various ways in which you'll be able to
        contribute to {config?.language}
      </p>
      <h3>Exercises that need implementing</h3>
      <p>The following exercise are all open to be worked on</p>
      {asyncNewConceptExerciseIssues.done ? (
        asyncNewConceptExerciseIssues.result?.map((issue) => (
          <NewConceptExerciseToImplement
            key={issue.number}
            issue={issue}
            trackId={trackId}
          />
        ))
      ) : (
        <p>TODO: loading indicator</p>
      )}
    </>
  )
}

interface NewConceptExerciseConceptsProps {
  concepts: string | undefined
}

function NewConceptExerciseConcepts({
  concepts,
}: NewConceptExerciseConceptsProps): JSX.Element {
  return (
    <dl className="card-text row">
      {concepts
        ?.split('\n')
        .filter((concept) => concept)
        .map((concept) => (
          <Fragment key={concept}>
            <dt className="col-sm-3">
              <code>
                {concept.slice(2, concept.indexOf(':')).replace(/`/g, '')}
              </code>
            </dt>
            <dd className="col-sm-9">
              {concept.slice(concept.indexOf(':') + 1)}
            </dd>
          </Fragment>
        ))}
    </dl>
  )
}

interface NewConceptExerciseToImplementProps {
  issue: NewConceptExerciseIssue
  trackId: TrackIdentifier
}

function NewConceptExerciseToImplement({
  issue,
  trackId,
}: NewConceptExerciseToImplementProps): JSX.Element {
  const tokens = marked.lexer(issue.body)

  let learningObjectives: string | undefined = undefined
  let outOfScope: string | undefined = undefined
  let concepts: string | undefined = undefined
  let prerequisites: string | undefined = undefined

  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i]

    if (
      token.type === 'heading' &&
      [
        'Learning objectives',
        'Out of scope',
        'Concepts',
        'Prerequisites',
        'Prequisites',
      ].includes(token.text)
    ) {
      let nextToken: any | undefined = undefined

      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === 'heading') {
          nextToken = undefined
          break
        }

        if (tokens[j].type === 'list') {
          nextToken = tokens[j]
          break
        }
      }

      if (nextToken === undefined) {
        continue
      }

      switch (token.text) {
        case 'Learning objectives': {
          learningObjectives = nextToken.raw
          break
        }
        case 'Out of scope': {
          outOfScope = nextToken.raw
          break
        }
        case 'Concepts': {
          concepts = nextToken.raw
          break
        }
        case 'Prerequisites':
        case 'Prequisites': {
          console.log('prereqs')
          prerequisites = nextToken.raw
          break
        }
      }
    }
  }

  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">{issue.title}</h5>
        <NewConceptExerciseConcepts concepts={concepts} />
        <p className="card-text">
          <small className="text-muted">
            Last updated at: {issue.updatedAt}
          </small>
        </p>
        <a
          href={issue.url}
          className="card-link btn btn-sm btn-outline-primary mr-2"
        >
          Go to issue
        </a>
        <PageLink to={`/${trackId}/new-exercise`}>Create exercise</PageLink>
      </div>
    </div>

    /* So intro about the exercise taken from the issue or autogenerated. - Link
      to issue - List of links to exercises on other tracks that have implement
      the exercise
      <a href="Link to Form">Use this form</a> */
  )
}
