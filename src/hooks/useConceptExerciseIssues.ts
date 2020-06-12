import { useEffect, useState } from 'react'

export interface ConceptExerciseIssue {
  number: number
  title: string
  body: string
  url: string
  updatedAt: string
}

export type ConceptExerciseIssueResult<T> = {
  result: T | undefined
  error: boolean
  done: boolean
}

function useConceptExerciseIssuesApi<T>(
  url: string
): ConceptExerciseIssueResult<T> {
  const [state, setState] = useState<ConceptExerciseIssueResult<T>>({
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
            result: json as T,
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
  }, [url, state])

  return state
}

export function useCreationConceptExerciseIssues(
  trackId: TrackIdentifier
): ConceptExerciseIssueResult<ConceptExerciseIssue[]> {
  return useConceptExerciseIssuesApi(
    `http://lvh.me:3000/git_api/tracks/${trackId}/creation_issues`
  )
}

export function useCreationConceptExerciseIssuesCount(
  trackId: TrackIdentifier
): ConceptExerciseIssueResult<number> {
  return useConceptExerciseIssuesApi(
    `http://lvh.me:3000/git_api/tracks/${trackId}/creation_issues_count`
  )
}

export function useImproveConceptExerciseIssues(
  trackId: TrackIdentifier
): ConceptExerciseIssueResult<ConceptExerciseIssue[]> {
  return useConceptExerciseIssuesApi(
    `http://lvh.me:3000/git_api/tracks/${trackId}/improve_issues`
  )
}
