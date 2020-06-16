import React from 'react'
import { LoadingIndicator } from './LoadingIndicator'

type SubmitTypes = {
  message: string
  step: string
  totalSteps: string
}

export function SubmitIndicator({
  message,
  step,
  totalSteps,
}: SubmitTypes): JSX.Element {
  return (
    <div className="vh-70 d-flex flex-column justify-content-center align-items-center">
      <LoadingIndicator />
      <p>
        {message} {step}/{totalSteps}
      </p>
    </div>
  )
}
