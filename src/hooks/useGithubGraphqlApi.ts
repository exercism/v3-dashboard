import { useReducer, useEffect, useState } from 'react'
import { graphql } from '@octokit/graphql'

// TODO: take rate limiting into account

type GithubGraphqlResult<T> = {
  result: T | undefined
  error: string | undefined
  done: boolean
}

export function useGithubGraphqlApi<T>(): GithubGraphqlResult<T> {
  const [state, setState] = useState<GithubGraphqlResult<T>>({
    result: undefined,
    error: undefined,
    done: false,
  })

  useEffect(() => {
    if (state.done === true) {
      return
    }

    graphql(
      `
        {
          repository(name: "v3", owner: "exercism") {
            id
            issues(
              first: 100
              states: [OPEN]
              filterBy: { labels: ["track/csharp"] }
            ) {
              edges {
                node {
                  id
                  title
                  body
                  labels(first: 20) {
                    edges {
                      node {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        headers: {
          authorization: `token secret123`,
        },
      }
    )
      .then((response) =>
        setState({ result: response as T, done: true, error: undefined })
      )
      .catch((err) => setState({ result: undefined, done: true, error: err }))
  })

  return state
}
