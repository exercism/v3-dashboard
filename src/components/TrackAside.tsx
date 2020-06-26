import React from 'react'
import { useRemoteConfig } from '../hooks/useRemoteConfig'
import { useTrackAsideData } from '../hooks/useTrackData'
import { LoadingIconWithPopover } from './Popover'
import { useToggleState } from '../hooks/useToggleState'
import { useKeyPressListener } from '../hooks/useKeyListener'
import { useActionableState } from '../hooks/useActionableOnly'
import {
  useOpenImproveConceptExerciseIssues,
  useOpenCreationConceptExerciseIssues,
  OpenImproveConceptExerciseIssueData,
  OpenCreationConceptExerciseIssueData,
} from '../hooks/useConceptExerciseIssues'
import { LoadingIndicator } from './LoadingIndicator'

export interface TrackAsideProps {
  trackId: TrackIdentifier
}

export function TrackAside({ trackId }: TrackAsideProps): JSX.Element {
  const { done: doneConfig, config } = useRemoteConfig(trackId)
  const { result: openCreationIssues } = useOpenCreationConceptExerciseIssues(
    trackId
  )
  const { result: openImproveIssues } = useOpenImproveConceptExerciseIssues(
    trackId
  )
  const { done, data } = useTrackAsideData(trackId)
  const [actionableOnly] = useActionableState()

  const [activeDetailsKey, setActiveDetailsKey] = useToggleState<
    HTMLUListElement
  >(undefined, 'popover', 'popover-toggle')

  useKeyPressListener(['Esc', 'Escape'], setActiveDetailsKey)

  return (
    <aside className="mt-md-4 mb-4 col-md">
      <ul className="list-group" style={{ whiteSpace: 'nowrap' }}>
        <li className="list-group-item d-flex justify-content-between">
          <RepositoryLink repository={trackId}>Repository</RepositoryLink>
        </li>
        <AsideItem disabled={actionableOnly && !!config}>
          <a
            href={`https://github.com/exercism/v3/blob/master/languages/${trackId}/config.json`}
            className="d-block mr-4"
          >
            Configuration
          </a>

          <ConfigurationIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={(): void => setActiveDetailsKey('config.json')}
            trackId={trackId}
            loading={!doneConfig}
            valid={!!config}
          />
        </AsideItem>
        <AsideItem disabled={actionableOnly && !!config}>
          <span>Concept exercises</span>

          {doneConfig &&
            config &&
            config.exercises &&
            config.exercises.concept &&
            config.exercises.concept.length}
        </AsideItem>

        <AsideItem disabled={actionableOnly && !!config}>
          <span>Practice exercises</span>

          {doneConfig &&
            config &&
            config.exercises &&
            config.exercises.practice &&
            config.exercises.practice.length}
        </AsideItem>

        <AsideItem disabled={actionableOnly}>
          <IssuesLink trackId={trackId} type="new-exercise">
            Create Concept exercise issues
          </IssuesLink>
          <IssuesCount
            issues={openCreationIssues}
            trackId={trackId}
            type="new-exercise"
          />
        </AsideItem>

        <AsideItem disabled={actionableOnly}>
          <IssuesLink trackId={trackId} type="improve-exercise">
            Improve Concept exercise issues
          </IssuesLink>
          <IssuesCount
            issues={openImproveIssues}
            trackId={trackId}
            type="improve-exercise"
          />
        </AsideItem>

        <AsideItem disabled={actionableOnly && data['testRunner'] === true}>
          <RepositoryLink repository={`${trackId}-test-runner`}>
            Test Runner
          </RepositoryLink>
          <TestRunnerIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={(): void => setActiveDetailsKey('test-runner')}
            trackId={trackId}
            loading={!done}
            valid={data['testRunner'] === true}
          />
        </AsideItem>
        <AsideItem disabled={actionableOnly && data['representer'] === true}>
          <RepositoryLink repository={`${trackId}-representer`}>
            Solution Representer
          </RepositoryLink>
          <RepresenterIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={(): void => setActiveDetailsKey('representer')}
            trackId={trackId}
            loading={!done}
            valid={data['representer'] === true}
          />
        </AsideItem>
        <AsideItem disabled={actionableOnly && data['analyzer'] === true}>
          <RepositoryLink repository={`${trackId}-analyzer`}>
            Solution Automated Analysis
          </RepositoryLink>
          <AnalyzerIcon
            currentDetails={activeDetailsKey}
            onToggleDetails={(): void => setActiveDetailsKey('analyzer')}
            trackId={trackId}
            loading={!done}
            valid={data['analyzer'] === true}
          />
        </AsideItem>
      </ul>
    </aside>
  )
}

function AsideItem({
  disabled,
  children,
}: {
  disabled?: boolean
  children: React.ReactNode
}): JSX.Element {
  return (
    <li
      className={`list-group-item d-flex justify-content-between ${
        disabled ? 'not-actionable' : ''
      }`}
    >
      {children}
    </li>
  )
}

type IssueType = 'new-exercise' | 'improve-exercise'

interface IssuesLinkProps {
  children: React.ReactNode
  trackId: TrackIdentifier
  type: IssueType
}

function IssuesLink({ children, trackId, type }: IssuesLinkProps): JSX.Element {
  return (
    <a
      href={`https://github.com/exercism/v3/issues?q=is%3Aissue+is%3Aopen+label%3Atrack%2F${trackId}+label%3Atype%2F${type}`}
    >
      {children}
    </a>
  )
}

interface IssuesCountProps {
  issues:
    | Array<
        | OpenImproveConceptExerciseIssueData
        | OpenCreationConceptExerciseIssueData
      >
    | undefined
  trackId: TrackIdentifier
  type: 'new-exercise' | 'improve-exercise'
}

function IssuesCount({ issues, trackId, type }: IssuesCountProps): JSX.Element {
  if (issues === undefined) {
    return <LoadingIndicator />
  }

  return (
    <IssuesLink trackId={trackId} type={type}>
      {issues.length}
    </IssuesLink>
  )
}

function RepositoryLink({
  children,
  repository,
  organisation = 'exercism',
}: {
  children: React.ReactNode
  organisation?: string
  repository: string
}): JSX.Element {
  return (
    <a
      href={`https://github.com/${organisation}/${repository}`}
      className="d-block mr-4"
    >
      {children}
    </a>
  )
}

interface PreconfiguredIconProps {
  loading: boolean
  valid: boolean
  onToggleDetails: () => void
  currentDetails: string | undefined
}

const ConfigurationIcon = ({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
  trackId,
}: PreconfiguredIconProps & { trackId: TrackIdentifier }): JSX.Element => (
  <LoadingIconWithPopover
    active={currentDetails === 'config.json'}
    loading={loading}
    valid={valid}
    onToggle={onToggleDetails}
  >
    <p>
      This check passes if there is a <code>config.json</code> file present at
      in the <code>languages/{trackId}</code> folder of the v3 repository.
    </p>
    <p className="mb-0">
      You can find more information about the <code>config.json</code> file{' '}
      <a href="https://github.com/exercism/problem-specifications/blob/master/CONTRIBUTING.md#track-configuration-file">
        here
      </a>
      .
    </p>
  </LoadingIconWithPopover>
)

function AnalyzerIcon({
  loading,
  valid,
  currentDetails,
  onToggleDetails,
  trackId,
}: PreconfiguredIconProps & { trackId: TrackIdentifier }): JSX.Element {
  return (
    <LoadingIconWithPopover
      active={currentDetails === 'analyzer'}
      loading={loading}
      valid={valid}
      onToggle={onToggleDetails}
    >
      <p>
        This check passes if there is a <code>Dockerfile</code> file present in
        the <code>exercism/{trackId}-analyzer</code> repository.
      </p>

      <p className="mb-0">
        You can find more information about the <code>Dockerfile</code> file{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/master/docs/docker.md">
          here
        </a>
        , or about{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/master/docs/about.md">
          the automated analysis in general
        </a>
        , as well as the steps to{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/master/docs/analyzers/getting-started.md">
          pass this test
        </a>
        .
      </p>
    </LoadingIconWithPopover>
  )
}

function TestRunnerIcon({
  loading,
  valid,
  onToggleDetails,
  trackId,
  currentDetails,
}: PreconfiguredIconProps & { trackId: TrackIdentifier }): JSX.Element {
  return (
    <LoadingIconWithPopover
      active={currentDetails === 'test-runner'}
      loading={loading}
      valid={valid}
      onToggle={onToggleDetails}
    >
      <p>
        This check passes if there is a <code>Dockerfile</code> file present in
        the <code>exercism/{trackId}-test-runner</code> repository.
      </p>

      <p className="mb-0">
        You can find more information about the <code>Dockerfile</code> file{' '}
        <a href="https://github.com/exercism/automated-tests/blob/master/docs/docker.md">
          here
        </a>
      </p>
    </LoadingIconWithPopover>
  )
}

function RepresenterIcon({
  loading,
  valid,
  onToggleDetails,
  trackId,
  currentDetails,
}: PreconfiguredIconProps & { trackId: TrackIdentifier }): JSX.Element {
  return (
    <LoadingIconWithPopover
      active={currentDetails === 'representer'}
      loading={loading}
      valid={valid}
      onToggle={onToggleDetails}
    >
      <p>
        This check passes if there is a <code>Dockerfile</code> file present in
        the <code>exercism/{trackId}-representer</code> repository.
      </p>

      <p className="mb-0">
        You can find more information about the <code>Dockerfile</code> file{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/master/docs/docker.md">
          here
        </a>
        , or about{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/master/docs/about.md">
          the automated analysis in general
        </a>
        , as well as the steps to{' '}
        <a href="https://github.com/exercism/automated-analysis/blob/master/docs/representers/getting-started.md">
          pass this test
        </a>
        .
      </p>
    </LoadingIconWithPopover>
  )
}
