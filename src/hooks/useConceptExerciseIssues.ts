import { useEffect, useState } from 'react'

export interface ConceptExerciseIssue {
  number: number
  title: string
  body: string
  url: string
  updatedAt: string
  labels: string[]
}

export type ConceptExerciseIssueResult = {
  result: ConceptExerciseIssue[] | undefined
  error: boolean
  done: boolean
}

function useConceptExerciseIssues(
  trackId: TrackIdentifier,
  url: string
): ConceptExerciseIssueResult {
  const [state, setState] = useState<ConceptExerciseIssueResult>({
    result: undefined,
    error: false,
    done: false,
  })

  useEffect(() => {
    if (state.done === true) {
      return
    }

    let isMounted = true

    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (isMounted) {
          setState({
            result: json as ConceptExerciseIssue[],
            done: true,
            error: false,
          })
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({ result: undefined, done: true, error: true })
        }
      })

    return () => {
      isMounted = false
    }
  }, [url, trackId, state])

  return state
}

export function useCreationConceptExerciseIssues(
  trackId: TrackIdentifier
): ConceptExerciseIssueResult {
  return useConceptExerciseIssues(
    trackId,
    `http://lvh.me:3000/git_api/tracks/${trackId}/creation_issues`
  )
}

export function useImproveConceptExerciseIssues(
  trackId: TrackIdentifier
): ConceptExerciseIssueResult {
  return useConceptExerciseIssues(
    trackId,
    `http://lvh.me:3000/git_api/tracks/${trackId}/improve_issues`
  )
}
