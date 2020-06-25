import { useEffect, useState } from 'react'

export interface StoryImplementation {
  track: string
  slug: string
  exercise: string
  url: string
}

export interface StoryConcept {
  url: string
  name: string
}

export interface Story {
  url: string
  name: string
  description: string
  concept: StoryConcept
  implementations: StoryImplementation[]
}

export interface StoriesResult {
  result: Story[] | undefined
  error: boolean
  loading: boolean
}

export function useStories(): StoriesResult {
  const [state, setState] = useState<StoriesResult>({
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
      'https://raw.githubusercontent.com/exercism/v3/master/reference/stories/stories.json',
      { headers: { accept: 'application/json' } }
    )
      .then((response) => response.json())
      .then((json) => {
        if (!requestIsStale) {
          setState({
            result: json as Story[],
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
