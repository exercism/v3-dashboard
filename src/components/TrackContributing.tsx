import { Parser, Node } from 'commonmark'
import React from 'react'
import { useParams } from 'react-router-dom'

import {
  ConceptExerciseIssue,
  useCreationConceptExerciseIssues,
  useImproveConceptExerciseIssues,
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
  const asyncNewConceptExerciseIssues = useCreationConceptExerciseIssues(
    trackId
  )
  const asyncImproveConceptExerciseIssues = useImproveConceptExerciseIssues(
    trackId
  )

  return (
    <>
      <h2>Contributing to {config?.language} </h2>
      <p>
        On this page you'll find various ways in which you'll be able to
        contribute to {config?.language}
      </p>
      <h3>Exercises that need implementing</h3>

      {asyncNewConceptExerciseIssues.done ? (
        <>
          <p>The following exercise are all open to be worked on</p>
          {asyncNewConceptExerciseIssues.result?.map((issue) => (
            <NewConceptExerciseIssue
              key={issue.number}
              issue={issue}
              trackId={trackId}
            />
          ))}
        </>
      ) : (
        <LoadingIndicator>
          Loading new concept exercise issues...
        </LoadingIndicator>
      )}
      <h3>Exercises that need improving</h3>
      {asyncImproveConceptExerciseIssues.done ? (
        <>
          <p>The following exercise are all open to be improved</p>
          {asyncImproveConceptExerciseIssues.result?.map((issue) => (
            <ImproveConceptExerciseIssue
              key={issue.number}
              issue={issue}
              trackId={trackId}
            />
          ))}
        </>
      ) : (
        <LoadingIndicator>
          Loading improve concept exercise issues...
        </LoadingIndicator>
      )}
    </>
  )
}

interface NewConceptExerciseToImplementProps {
  issue: ConceptExerciseIssue
  trackId: TrackIdentifier
}

interface NewConceptExerciseIssueSection {
  heading: string
  markdown: string | undefined
  node: Node | undefined
}

interface NewConceptExerciseIssueSections {
  outOfScope: NewConceptExerciseIssueSection | undefined
  prerequisites: NewConceptExerciseIssueSection | undefined
  concepts: NewConceptExerciseIssueSection | undefined
  learningObjectives: NewConceptExerciseIssueSection | undefined
}

function parseIssueSections(markdown: string): NewConceptExerciseIssueSections {
  const sections = parseListSections(markdown)

  return {
    outOfScope: sections['Out of scope'],
    prerequisites: sections['Prerequisites'] || sections['Prequisites'],
    concepts: sections['Concepts'],
    learningObjectives: sections['Learning objectives'],
  }
}

function parseListSections(
  markdown: string
): { [heading: string]: NewConceptExerciseIssueSection } {
  const parser = new Parser()
  const parsed = parser.parse(markdown)
  const lines = markdown.split('\n')

  const headingsWithList: {
    [heading: string]: NewConceptExerciseIssueSection
  } = {}

  let node = parsed.firstChild
  let currentHeading: string | undefined

  while (node?.next) {
    if (node.type === 'heading' && node.firstChild?.literal) {
      currentHeading = node.firstChild.literal
    } else if (node.type === 'list' && currentHeading) {
      headingsWithList[currentHeading] = {
        node: node,
        heading: currentHeading,
        markdown: lines
          .slice(node.sourcepos[0][0] - 1, node.sourcepos[1][0] - 1)
          .join('\n'),
      }
    }

    node = node.next
  }

  return headingsWithList
}

function NewConceptExerciseIssue({
  issue,
  trackId,
}: NewConceptExerciseToImplementProps): JSX.Element {
  const sections = parseIssueSections(issue.body)
  const state: TrackNewExerciseLocationState = {
    concepts: sections.concepts?.markdown,
    outOfScope: sections.outOfScope?.markdown,
    prerequisites: sections.prerequisites?.markdown,
    learningObjectives: sections.learningObjectives?.markdown,
  }

  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">
          {issue.title.slice(issue.title.indexOf(':') + 1)}
        </h5>
        <p className="card-text">
          <small className="text-muted">
            Last updated at: {issue.updatedAt}
          </small>
        </p>
        <PageLink to={`/${trackId}/new-exercise`} state={state}>
          Create exercise
        </PageLink>
        <a
          href={issue.url}
          className="card-link btn btn-sm btn-outline-primary ml-2"
        >
          Go to issue
        </a>
      </div>
    </div>
  )
}

function ImproveConceptExerciseIssue({
  issue,
  trackId,
}: NewConceptExerciseToImplementProps): JSX.Element {
  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">{issue.title.replace(/^\[.+?\]\s*/, '')}</h5>
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
      </div>
    </div>
  )
}
