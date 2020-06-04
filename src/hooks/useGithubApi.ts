import { useReducer, useEffect } from 'react'

const CACHE: Record<string, boolean | undefined> = {}

type FetchAction<T> =
  | { type: 'result'; key: string; result: T }
  | { type: 'error' }

type FetchState<T> = { result: undefined | T; loading: boolean }

function initialState<T>(): FetchState<T> {
  return {
    loading: true,
    result: undefined,
  }
}

function fetchReducer<T>(
  state: Readonly<FetchState<T>>,
  action: FetchAction<T>
): Readonly<FetchState<T>> {
  switch (action.type) {
    case 'result': {
      return { ...state, result: action.result, loading: false }
    }
    case 'error': {
      return { ...state, loading: false }
    }
  }
}

export function useGithubApi<T>({
  repository,
  path,
  params,
}: {
  repository: string
  path: string
  params?: string | undefined
}): {
  url: string
  rawUrl: string
  done: boolean
  result: T | undefined
} {
  const key = `${repository}/${path}?${params}`
  const initial = initialState<T>()
  const [state, dispatch] = useReducer(fetchReducer, {
    ...initialState<T>(),
    result: CACHE[key],
  })

  const url = `https://github.com/exercism/${repository}/${path}?${params}`
  const rawUrl = `https://api.github.com/repos/exercism/${repository}/${path}?${params}`

  useEffect(() => {
    if (state.result !== undefined) {
      return
    }

    let active = true

    fetch(rawUrl, { method: 'GET' })
      .then((result) =>
        Promise.resolve(result.ok).then((ok) => ok && result.json())
      )
      .then((json) => {
        if (active) {
          dispatch({ type: 'result', result: json as T, key })
        }
      })
      .catch(() => {
        if (active) {
          dispatch({ type: 'error' })
        }
      })

    return (): void => {
      active = false
    }
  }, [key, rawUrl, state])

  return {
    url,
    rawUrl,
    done: !state.loading,
    result: state.result as T | undefined,
  }
}

export function useGithubApiMatches<T>({
  repository,
  path,
  params,
  matcher,
}: {
  repository: string
  path: string
  params?: string | undefined
  matcher: (data: T) => boolean
}): {
  url: string
  rawUrl: string
  done: boolean
  result: boolean | undefined
} {
  const key = `${repository}/${path}?${params}`
  const [state, dispatch] = useReducer(fetchReducer, {
    ...initialState(),
    result: CACHE[key],
  })

  const url = `https://github.com/exercism/${repository}/${path}?${params}`
  const rawUrl = `https://api.github.com/repos/exercism/${repository}/${path}?${params}`

  useEffect(() => {
    if (state.result !== undefined) {
      return
    }

    let active = true

    fetch(rawUrl, { method: 'GET' })
      .then(
        (result) =>
          Promise.resolve(result.ok).then(
            (ok) => ok && result.json().then(matcher)
          ),
        () => false
      )
      .then((result) => {
        if (active) {
          dispatch({ type: 'result', result, key })
        }
      })
      .catch(() => {
        if (active) {
          dispatch({ type: 'error' })
        }
      })

    return (): void => {
      active = false
    }
  }, [key, rawUrl, state, matcher])

  return {
    url,
    rawUrl,
    done: !state.loading,
    result: state.result as boolean | undefined,
  }
}
