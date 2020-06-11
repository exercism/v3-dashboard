import { Parser, Node } from 'commonmark'
import React, { Fragment } from 'react'
import { useParams } from 'react-router-dom'

import {
  useNewConceptExerciseIssues,
  NewConceptExerciseIssue,
} from '../hooks/useNewConceptExerciseIssues'
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
  concepts: Node[]
}

function NewConceptExerciseConcepts({
  concepts,
}: NewConceptExerciseConceptsProps): JSX.Element {
  return (
    <dl className="card-text row">
      {concepts.map((concept, i) => (
        <Fragment key={`concept-${i}`}>
          <dt className="col-sm-3">
            {renderNode(concept.firstChild?.firstChild)}
          </dt>
          <dd className="col-sm-9">
            {renderNode(concept.firstChild?.firstChild?.next, (value) =>
              value.replace(/^:\s*/, '')
            )}
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

interface NewConceptExerciseIssueData {
  outOfScope: Node[] | undefined
  prerequisites: Node[] | undefined
  concepts: Node[] | undefined
  learningObjectives: Node[] | undefined
}

function parseIssueData(markdown: string): NewConceptExerciseIssueData {
  const listSections = parseListSections(markdown)

  return {
    outOfScope: listSections['Out of scope'],
    prerequisites: listSections['Prerequisites'] || listSections['Prequisites'],
    concepts: listSections['Concepts'],
    learningObjectives: listSections['Learning objectives'],
  }
}

function parseListSections(markdown: string): { [heading: string]: Node[] } {
  const parser = new Parser()
  const parsed = parser.parse(markdown)

  let node = parsed.firstChild
  let currentSection: string | undefined

  const sections: { [key: string]: Node[] } = {}

  while (node?.next) {
    if (node.type === 'heading' && node.firstChild?.literal) {
      currentSection = node.firstChild.literal
      sections[currentSection] = []
    } else if (node.type === 'list' && currentSection) {
      let child = node.firstChild

      while (child) {
        if (child.type === 'item') {
          sections[currentSection].push(child)
        }

        child = child.next
      }
    }

    node = node.next
  }

  return sections
}

function renderNode(
  node: Node | null | undefined,
  map?: (value: string) => string
): JSX.Element {
  if (!node?.literal) {
    return <></>
  }

  const text = map ? map(node.literal) : node.literal
  return node.type === 'code' ? <code>{text}</code> : <span>{text}</span>
}

function NewConceptExerciseToImplement({
  issue,
  trackId,
}: NewConceptExerciseToImplementProps): JSX.Element {
  const issueData = parseIssueData(issue.body)
  const lines = issue.body.split('\n')

  const nodesToMarkdown = (node: Node[]): string => {
    if (node.length == 0) {
      return ''
    }

    const startLine = node[0].sourcepos[0][0]
    const endLine = node[node.length - 1].sourcepos[1][0]

    return lines.slice(startLine, endLine).join('\n')
  }

  const locationState: TrackNewExerciseLocationState = {
    learningObjectives: nodesToMarkdown(issueData.learningObjectives || []),
    outOfScope: nodesToMarkdown(issueData.outOfScope || []),
    concepts: nodesToMarkdown(issueData.concepts || []),
    prerequisites: nodesToMarkdown(issueData.prerequisites || []),
  }

  return (
    <div className="card mb-2">
      <div className="card-body">
        <h5 className="card-title">{issue.title}</h5>
        <NewConceptExerciseConcepts concepts={issueData.concepts || []} />
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
        <PageLink to={`/${trackId}/new-exercise`} state={locationState}>
          Create exercise
        </PageLink>
      </div>
    </div>

    /* So intro about the exercise taken from the issue or autogenerated. - Link
      to issue - List of links to exercises on other tracks that have implement
      the exercise
      <a href="Link to Form">Use this form</a> */
  )
}
