import React from 'react'

interface TrackDescriptionProps {
  config: TrackConfiguration | undefined
}

export function TrackDescription({
  config,
}: TrackDescriptionProps): JSX.Element | null {
  if (!config) {
    return null
  }

  return <blockquote className="card-text">{config.blurb}</blockquote>
}
