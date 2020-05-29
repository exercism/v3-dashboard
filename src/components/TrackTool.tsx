import React, { useCallback } from 'react'

import {
  ProvideActionable,
  useProvideActionableState,
} from '../hooks/useActionableOnly'
import { usePage } from '../hooks/useUrlState'

import { PageSelectLink } from './PageSelectLink'
import { TrackContributing } from './TrackContributing'
import { TrackMaintaining } from './TrackMaintaining'
import { TrackNewExercise } from './TrackNewExercise'

const DEFAULT_PAGE: Page = 'contributing'

export interface TrackToolProps {
  trackId: TrackIdentifier
  onUnselect: () => void
}

export function TrackTool({
  trackId,
  onUnselect,
}: TrackToolProps): JSX.Element {
  return (
    <ProvideActionable value={useProvideActionableState()}>
      <section>
        <div className="d-flex justify-content-start flex-row align-items-center w-50">
          <UnselectTrackButton onClick={onUnselect} />
          <TogglePageButton />
        </div>

        <PageView trackId={trackId} />
      </section>
    </ProvideActionable>
  )
}

function PageView({ trackId }: { trackId: TrackIdentifier }): JSX.Element {
  const [selectedPage] = usePage()
  const actualPage = selectedPage || DEFAULT_PAGE

  switch (actualPage) {
    case 'maintaining': {
      return <TrackMaintaining trackId={trackId} />
    }
    case 'new-exercise': {
      return <TrackNewExercise trackId={trackId} />
    }
    default: {
      return <TrackContributing trackId={trackId} />
    }
  }
}

function TogglePageButton(): JSX.Element {
  return (
    <div className="btn-group">
      <PageSelectLink page="contributing">Contributing</PageSelectLink>
      <PageSelectLink page="maintaining">Maintaining</PageSelectLink>
      <PageSelectLink page="new-exercise">New exercise</PageSelectLink>
    </div>
  )
}

function UnselectTrackButton({
  onClick,
}: {
  onClick: TrackToolProps['onUnselect']
}): JSX.Element {
  const doClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      onClick()
    },
    [onClick]
  )

  return (
    <a
      href="/"
      className="btn btn-sm btn-outline-danger mr-3"
      onClick={doClick}
    >
      Select different track
    </a>
  )
}
