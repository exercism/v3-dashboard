import { useEffect, useState } from 'react'
import { Parser, Node } from 'commonmark'

import { useStories } from './useStories'
import { useTracks } from './useTracks'

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

export interface OpenCreationConceptExerciseIssueSectionData {
  heading: string
  markdown: string | undefined
  node: Node | undefined
}

export interface OpenCreationConceptExerciseIssueSectionsData {
  outOfScope: OpenCreationConceptExerciseIssueSectionData | undefined
  prerequisites: OpenCreationConceptExerciseIssueSectionData | undefined
  concepts: OpenCreationConceptExerciseIssueSectionData | undefined
  learningObjectives: OpenCreationConceptExerciseIssueSectionData | undefined
}

export interface OpenCreationConceptExerciseIssueStoryData {
  url: string
  name: string
}

export interface OpenCreationConceptExerciseIssueExistingImplementationExercise {
  url: string
  slug: string
}

export interface OpenCreationConceptExerciseIssueExistingImplementationTrackData {
  name: string
  slug: string
}

export interface OpenCreationConceptExerciseIssueExistingImplementationData {
  track: OpenCreationConceptExerciseIssueExistingImplementationTrackData
  exercise: OpenCreationConceptExerciseIssueExistingImplementationExercise
}

export interface OpenCreationConceptExerciseIssueReferenceDocumentData {
  name: string
  url?: string
}

export interface OpenCreationConceptExerciseIssueData {
  concept: string
  number: number
  title: string
  url: string
  updatedAt: Date
  referenceDocument: OpenCreationConceptExerciseIssueReferenceDocumentData
  sections: OpenCreationConceptExerciseIssueSectionsData
  stories: OpenCreationConceptExerciseIssueStoryData[] | undefined
  implementations:
    | OpenCreationConceptExerciseIssueExistingImplementationData[]
    | undefined
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
): OpenCreationConceptExerciseIssueSectionsData {
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
): { [heading: string]: OpenCreationConceptExerciseIssueSectionData } {
  const parser = new Parser()
  const parsed = parser.parse(markdown)
  const lines = markdown.split('\n')

  const headingsWithList: {
    [heading: string]: OpenCreationConceptExerciseIssueSectionData
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
  const initial: OpenCreationConceptExerciseIssuesResult = {
    result: undefined,
    error: false,
    loading: true,
  }
  const [result, setResult] = useState(initial)

  const storiesResult = useStories()
  const tracksResult = useTracks()
  const issuesApiResult = useConceptExerciseIssuesApi(
    `${process.env.REACT_APP_EXERCISM_HOST}/git_api/tracks/${trackId}/open_creation_issues`,
    (issues) => issues as ConceptExerciseIssue[]
  )

  useEffect(() => {
    if (
      issuesApiResult.loading ||
      storiesResult.loading ||
      tracksResult.loading ||
      result.result
    ) {
      return
    }

    function conceptFromIssue(issue: ConceptExerciseIssue): string {
      return issue.title
        .slice(issue.title.indexOf(':') + 1)
        .replace(/`(.+)`/, '$1')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
    }

    function referenceDocumentFromIssue(
      issue: ConceptExerciseIssue
    ): OpenCreationConceptExerciseIssueReferenceDocumentData {
      const concept = conceptFromIssue(issue)

      for (const track of tracksResult.result || []) {
        for (const exercise of track.exercises.concept) {
          const exerciseConcept = exercise.concepts.find(
            (exerciseConcept) => exerciseConcept.name === concept
          )

          if (exerciseConcept) {
            return {
              name: exerciseConcept.name,
              url: exerciseConcept.url,
            }
          }
        }
      }
      return {
        name: concept,
      }
    }

    function storiesForConcept(
      issue: ConceptExerciseIssue
    ): OpenCreationConceptExerciseIssueStoryData[] | undefined {
      if (!storiesResult.result) {
        return undefined
      }

      const concept = conceptFromIssue(issue)
      return storiesResult.result.filter(
        (story) => story.concept.name === concept
      )
    }

    function implementationsOfConcept(
      issue: ConceptExerciseIssue
    ):
      | OpenCreationConceptExerciseIssueExistingImplementationData[]
      | undefined {
      if (!tracksResult.result) {
        return undefined
      }

      const concept = conceptFromIssue(issue)
      const implementations = []

      for (const track of tracksResult.result || []) {
        for (const exercise of track.exercises.concept) {
          if (
            !exercise.concepts.some(
              (exerciseConcept) => exerciseConcept.name === concept
            )
          ) {
            continue
          }

          const implementation: OpenCreationConceptExerciseIssueExistingImplementationData = {
            exercise: {
              url: exercise.url,
              slug: exercise.slug,
            },
            track: {
              name: track.name,
              slug: track.slug,
            },
          }
          implementations.push(implementation)
        }
      }
      return implementations
    }

    function createOpenCreationConceptExerciseIssueData(
      issue: ConceptExerciseIssue
    ): OpenCreationConceptExerciseIssueData {
      return {
        concept: conceptFromIssue(issue),
        number: issue.number,
        title: issue.title,
        url: issue.url,
        updatedAt: new Date(issue.updatedAt),
        sections: parseIssueSections(issue.body),
        stories: storiesForConcept(issue),
        referenceDocument: referenceDocumentFromIssue(issue),
        implementations: implementationsOfConcept(issue),
      }
    }

    setResult({
      result: issuesApiResult.result?.map(
        createOpenCreationConceptExerciseIssueData
      ),
      error: issuesApiResult.error,
      loading: issuesApiResult.loading,
    })
  }, [result, setResult, storiesResult, tracksResult, issuesApiResult])

  return result
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
