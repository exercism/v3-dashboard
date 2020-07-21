import { useEffect, useState } from 'react'

export interface TrackConcept {
  url?: string
  name: string
}

export interface TrackConceptExercise {
  url: string
  slug: string
  concepts: TrackConcept[]
  prerequisites: TrackConcept[]
}

export interface TrackExercises {
  concept: TrackConceptExercise[]
}

export interface Track {
  url: string
  name: string
  slug: string
  exercises: TrackExercises
}

export interface TracksResult {
  result: Track[] | undefined
  error: boolean
  loading: boolean
}

export function useTracks(): TracksResult {
  const [state, setState] = useState<TracksResult>({
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
      'https://raw.githubusercontent.com/exercism/v3/master/languages/languages.json',
      { headers: { accept: 'application/json' } }
    )
      .then((response) => response.json())
      .then((json) => {
        if (!requestIsStale) {
          setState({
            result: json as Track[],
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
