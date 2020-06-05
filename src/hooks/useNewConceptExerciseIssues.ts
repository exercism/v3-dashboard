import { useEffect, useState } from 'react'

export interface NewConceptExerciseIssue {
  number: number
  title: string
  body: string
  url: string
  updatedAt: string
  labels: string[]
}

export type NewConceptExerciseIssueResult = {
  result: NewConceptExerciseIssue[] | undefined
  error: boolean
  done: boolean
}

export function useNewConceptExerciseIssues(
  trackId: TrackIdentifier
): NewConceptExerciseIssueResult {
  const [state, setState] = useState<NewConceptExerciseIssueResult>({
    result: undefined,
    error: false,
    done: false,
  })

  useEffect(() => {
    if (state.done === true) {
      return
    }

    let isMounted = true

    fetch(`http://lvh.me:3000/git_api/tracks/${trackId}/creation_issues`)
      .then((response) => response.json())
      .then((json) => {
        if (isMounted) {
          setState({
            result: json as NewConceptExerciseIssue[],
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
  }, [state])

  return state
}
