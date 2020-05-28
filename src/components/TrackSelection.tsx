import React, { useCallback } from 'react'

import TRACKS from '../data/tracks.json'

import { useTrack } from '../hooks/useUrlState'

const ENABLED_TRACKS = TRACKS as ReadonlyArray<TrackData>

function TrackSelectionItem({
  track,
  onSelect,
}: {
  track: TrackData
  onSelect: () => void
}): JSX.Element {
  return (
    <li className="list-inline-item mb-2">
      <button
        className={`btn btn-md btn-${
          track.versioning ? '' : 'outline-'
        }primary`}
        onClick={onSelect}
      >
        {track.name}
      </button>
    </li>
  )
}

export function TrackSelection(): JSX.Element {
  const [, onSelectTrack] = useTrack()

  const renderTrackSelectionItem = useCallback(
    (track: Readonly<TrackData>) => {
      const doSelectTrack = (): void => onSelectTrack(track.slug)
      return (
        <TrackSelectionItem
          key={track.slug}
          onSelect={doSelectTrack}
          track={track}
        />
      )
    },
    [onSelectTrack]
  )

  return (
    <section>
      <header className="mb-4">
        <h1 className="mb-4">Exercism: V3 Dashboard</h1>
      </header>
      <p>
        <span role="img" aria-label="hand waving">
          👋
        </span>{' '}
        <strong>Welcome!</strong> Thanks for being involved in the creation of
        version 3 (v3) of Exercism!{' '}
        <span role="img" aria-label="smiley face with party hat, celebrating">
          🥳
        </span>
      </p>
      <p>
        <strong>This dashboard</strong> is the central hub for how we're
        managing v3 of Exercism. Maintainers can use it to understand how their
        tracks are progressing, and contributors can use it to find out where
        help is required. If you're <strong>new to v3</strong>{' '}
        <a
          href="https://www.youtube.com/watch?v=5Cj1Dr9m3GM"
          target="_blank"
          rel="noopener noreferrer"
        >
          this video
        </a>{' '}
        and{' '}
        <a
          href="https://github.com/exercism/v3/issues/690"
          target="_blank"
          rel="noopener noreferrer"
        >
          this issue
        </a>{' '}
        give some introductory information. Contributions to the dashboard are
        welcome{' '}
        <a href="https://github.com/exercism/v3-dashboard">via GitHub</a>.{' '}
        <strong>If you get stuck</strong>, you can{' '}
        <a
          href="https://join.slack.com/t/exercism-team/shared_invite/zt-59aazo7p-VtFgs_vwZwdTwTBLkGYspQ"
          target="_blank"
          rel="noopener noreferrer"
        >
          join our Slack Workspace
        </a>{' '}
        and ask for help in the #v3 channel.
      </p>
      <p>
        <strong>To get started</strong>, choose the language you maintain or
        want to contribute to:
      </p>
      <ol className="list-inline">
        {ENABLED_TRACKS.map(renderTrackSelectionItem)}
      </ol>
      <p>
        If the track you want to work on isn't here, please open an issue at the{' '}
        <a href="https://github.com/exercism/v3">main v3 repo</a>.
      </p>
    </section>
  )
}
