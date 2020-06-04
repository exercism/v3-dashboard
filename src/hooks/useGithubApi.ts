import { useReducer, useEffect } from 'react'

const CACHE: Record<string, any | undefined> = {}

type FetchAction<T> =
  | { type: 'result'; key: string; result: T }
  | { type: 'error' }

type FetchState<T> = { result: T | undefined; loading: boolean }

function readCache<T>(key: string): T | undefined {
  return CACHE[key]
}

function writeCache<T>(key: string, value: T): void {
  CACHE[key] = value
}

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

export function useGithubApi<T, U = T>({
  repository,
  path,
  params,
  mapper,
}: {
  repository: string
  path: string
  params?: string | undefined
  mapper?: (from: T) => U
}): {
  url: string
  rawUrl: string
  done: boolean
  result: U | undefined
} {
  const key = `${repository}/${path}?${params}`
  const [state, dispatch] = useReducer(fetchReducer, {
    ...initialState<T>(),
    result: readCache(key),
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
          const typedResult = json as T
          const mappedResult = mapper ? mapper(typedResult) : typedResult

          writeCache<T | U>(key, mappedResult)
          dispatch({ type: 'result', result: mappedResult, key })
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
  }, [key, rawUrl, state, mapper])

  return {
    url,
    rawUrl,
    done: !state.loading,
    result: state.result as U | undefined, // TODO: don't use cast
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
    result: readCache(key),
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
          writeCache<boolean>(key, result)
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
    result: state.result as boolean | undefined, // TODO: don't use cast
  }
}
