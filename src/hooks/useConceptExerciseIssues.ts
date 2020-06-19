import { useEffect, useState } from 'react'
import { Parser, Node } from 'commonmark'

interface ConceptExerciseIssue {
  number: number
  title: string
  body: string
  url: string
  updatedAt: string
}

interface ConceptExerciseIssuesResult<T> {
  result: T | undefined
  error: boolean
  loading: boolean
}

export interface OpenCreationConceptExerciseIssuesResult
  extends ConceptExerciseIssuesResult<OpenCreationConceptExerciseIssueData[]> {}

export interface OpenCreationConceptExerciseIssueSection {
  heading: string
  markdown: string | undefined
  node: Node | undefined
}

export interface OpenCreationConceptExerciseIssueSections {
  outOfScope: OpenCreationConceptExerciseIssueSection | undefined
  prerequisites: OpenCreationConceptExerciseIssueSection | undefined
  concepts: OpenCreationConceptExerciseIssueSection | undefined
  learningObjectives: OpenCreationConceptExerciseIssueSection | undefined
}

export interface OpenCreationConceptExerciseIssueData {
  concept: string
  number: number
  title: string
  url: string
  updatedAt: Date
  sections: OpenCreationConceptExerciseIssueSections
}

export interface OpenImproveConceptExerciseIssuesResult
  extends ConceptExerciseIssuesResult<OpenImproveConceptExerciseIssueData[]> {}

export interface OpenImproveConceptExerciseIssueData {
  subject: string
  number: number
  title: string
  url: string
  updatedAt: Date
}

export interface NumberOfCreationConceptExerciseIssuesResult
  extends ConceptExerciseIssuesResult<number> {}

function useConceptExerciseIssuesApi<T>(
  url: string,
  mapper: (issues: any) => T
): ConceptExerciseIssuesResult<T> {
  const [state, setState] = useState<ConceptExerciseIssuesResult<T>>({
    result: undefined,
    error: false,
    loading: true,
  })

  useEffect(() => {
    if (!state.loading) {
      return
    }

    let requestIsStale = false

    fetch(url, { headers: { accept: 'application/json' } })
      .then((response) => response.json())
      .then((json) => {
        if (!requestIsStale) {
          setState({
            result: mapper(json),
            loading: false,
            error: false,
          })
        }
      })
      .catch(() => {
        if (!requestIsStale) {
          setState({ result: undefined, loading: false, error: true })
        }
      })

    return () => {
      requestIsStale = true
    }
  }, [url, mapper, state])

  return state
}

function parseIssueSections(
  markdown: string
): OpenCreationConceptExerciseIssueSections {
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
): { [heading: string]: OpenCreationConceptExerciseIssueSection } {
  const parser = new Parser()
  const parsed = parser.parse(markdown)
  const lines = markdown.split('\n')

  const headingsWithList: {
    [heading: string]: OpenCreationConceptExerciseIssueSection
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

export function useOpenCreationConceptExerciseIssues(
  trackId: TrackIdentifier
): OpenCreationConceptExerciseIssuesResult {
  function concept(issue: ConceptExerciseIssue): string {
    return issue.title
      .slice(issue.title.indexOf(':') + 1)
      .replace(/`(.+)`/, '$1')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
  }

  return useConceptExerciseIssuesApi(
    `${process.env.REACT_APP_EXERCISM_HOST}/git_api/tracks/${trackId}/open_creation_issues`,
    (issues) =>
      (issues as ConceptExerciseIssue[]).map((issue) => ({
        concept: concept(issue),
        number: issue.number,
        title: issue.title,
        url: issue.url,
        updatedAt: new Date(issue.updatedAt),
        sections: parseIssueSections(issue.body),
      }))
  )
}

export function useCreationConceptExerciseIssuesCount(
  trackId: TrackIdentifier
): NumberOfCreationConceptExerciseIssuesResult {
  return useConceptExerciseIssuesApi(
    `${process.env.REACT_APP_EXERCISM_HOST}/git_api/tracks/${trackId}/num_creation_issues`,
    (json) => json as number
  )
}

export function useOpenImproveConceptExerciseIssues(
  trackId: TrackIdentifier
): OpenImproveConceptExerciseIssuesResult {
  function subject(issue: ConceptExerciseIssue): string {
    return issue.title
      .replace(/^\[.+?\]\s*/, '')
      .replace(/^Improve exercise:\s*/i, '')
  }

  return useConceptExerciseIssuesApi(
    `${process.env.REACT_APP_EXERCISM_HOST}/git_api/tracks/${trackId}/open_improve_issues`,
    (issues) =>
      (issues as ConceptExerciseIssue[]).map((issue) => ({
        subject: subject(issue),
        number: issue.number,
        title: issue.title,
        url: issue.url,
        updatedAt: new Date(issue.updatedAt),
      }))
  )
}
