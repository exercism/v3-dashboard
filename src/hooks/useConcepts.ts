import { useEffect, useState } from 'react'

export interface ConceptImplementation {
  track: string
  language: string
  exercise: string
  url: string
}

export interface Concept {
  url: string
  name: string
  variations: string[]
  implementations: ConceptImplementation[]
}

export interface ConceptsResult {
  result: Concept[] | undefined
  error: boolean
  loading: boolean
}

export function useConcepts(): ConceptsResult {
  const [state, setState] = useState<ConceptsResult>({
    result: undefined,
    error: false,
    loading: true,
  })

  useEffect(() => {
    if (!state.loading) {
      return
    }

    let requestIsStale = false

    fetch(
      'https://raw.githubusercontent.com/exercism/v3/master/reference/references.json',
      { headers: { accept: 'application/json' } }
    )
      .then((response) => response.json())
      .then((json) => {
        if (!requestIsStale) {
          setState({
            result: json as Concept[],
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
  }, [state])

  return state
}
