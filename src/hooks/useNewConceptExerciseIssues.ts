import { useGithubApi } from './useGithubApi'

interface GithubIssueUserData {
  login: string
  avatar_url: string
}

interface GithubIssuePullRequestData {
  html_url: string
}

interface GithubIssueData {
  id: number
  title: string
  number: number
  html_url: string
  user: GithubIssueUserData
  pull_request: GithubIssuePullRequestData
}

export interface NewConceptExerciseIssue {
  id: number
  title: string
  url: string
}

function createNewConceptExerciseIssuesFromApiIssue(
  issue: GithubIssueData
): NewConceptExerciseIssue {
  return {
    id: issue.id,
    title: issue.title.substr(issue.title.indexOf(':') + 1),
    url: issue.html_url,
  }
}

function newConceptExerciseIssuesMapper(
  issues: GithubIssueData[]
): NewConceptExerciseIssue[] {
  return issues
    .filter((issue) => !issue.pull_request)
    .map(createNewConceptExerciseIssuesFromApiIssue)
    .sort((a, b) => a.title.localeCompare(b.title))
}

export function useNewConceptExerciseIssues(
  trackId: TrackIdentifier
): {
  url: string
  rawUrl: string
  done: boolean
  result: NewConceptExerciseIssue[] | undefined
} {
  return useGithubApi<GithubIssueData[], NewConceptExerciseIssue[]>({
    repository: 'v3',
    path: `issues`,
    params: `labels=track/${trackId},type/new-exercise&state=open`,
    mapper: newConceptExerciseIssuesMapper,
  })
}
