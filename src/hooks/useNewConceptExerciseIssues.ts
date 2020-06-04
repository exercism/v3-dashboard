import { useGithubApi } from './useGithubApi'

export interface NewConceptExerciseIssueSummary {
  number: number
  title: string
  html_url: string
  updated_at: string
  pull_request?: object
}

export interface NewConceptExerciseIssueDetails {
  body: string
  number: number
  title: string
  html_url: string
  updated_at: string
  pull_request?: object
}

export interface GithubNewConceptExerciseIssueSummary {
  number: number
  title: string
  html_url: string
  updated_at: string
  pull_request?: object
}

export interface GithubNewConceptExerciseIssueDetails
  extends GithubNewConceptExerciseIssueSummary {
  body: string
}

function newConceptExerciseIssueSummaryMapper(
  issue: GithubNewConceptExerciseIssueSummary
): NewConceptExerciseIssueSummary {
  return {
    ...issue,
    title: normalizeTitle(issue.title),
  }
}

function newConceptExerciseIssuesSummaryMapper(
  issues: GithubNewConceptExerciseIssueSummary[]
): NewConceptExerciseIssueSummary[] {
  return issues
    .filter((issue) => !issue.pull_request)
    .map(newConceptExerciseIssueSummaryMapper)
    .sort((a, b) => a.title.localeCompare(b.title))
}

function newConceptExerciseIssueDetailsMapper(
  issue: GithubNewConceptExerciseIssueDetails
): NewConceptExerciseIssueDetails {
  return {
    ...issue,
    title: normalizeTitle(issue.title),
  }
}

function normalizeTitle(title: string) {
  return title.slice(title.indexOf(':') + 1)
}

export function useNewConceptExerciseIssues(
  trackId: TrackIdentifier
): {
  url: string
  rawUrl: string
  done: boolean
  result: NewConceptExerciseIssueSummary[] | undefined
} {
  return useGithubApi<
    GithubNewConceptExerciseIssueSummary[],
    NewConceptExerciseIssueSummary[]
  >({
    repository: 'v3',
    path: `issues`,
    params: `labels=track/${trackId},type/new-exercise&state=open`,
    mapper: newConceptExerciseIssuesSummaryMapper,
  })
}

export function useNewConceptExerciseIssue(
  number: number
): {
  url: string
  rawUrl: string
  done: boolean
  result: NewConceptExerciseIssueDetails | undefined
} {
  return useGithubApi<
    GithubNewConceptExerciseIssueDetails,
    NewConceptExerciseIssueDetails
  >({
    repository: 'v3',
    path: `issues/${number}`,
    mapper: newConceptExerciseIssueDetailsMapper,
  })
}
