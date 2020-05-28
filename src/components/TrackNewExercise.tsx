import React, { useState, FormEvent } from 'react'

export function TrackNewExercise({
  trackId,
}: {
  trackId: TrackIdentifier
}): JSX.Element {
  const [exampleFilename, setExampleFilename] = useState('')

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Exercise name</label>
        <input
          type="text"
          className="form-control"
          placeholder="E.g. interfaces"
          value={exampleFilename}
          onChange={(e) => setExampleFilename(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Design</label>
        <textarea
          className="form-control"
          value={exampleFilename}
          onChange={(e) => setExampleFilename(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Instructions</label>
        <textarea
          className="form-control"
          value={exampleFilename}
          onChange={(e) => setExampleFilename(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Example</label>
        <textarea
          className="form-control"
          value={exampleFilename}
          onChange={(e) => setExampleFilename(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Example filename</label>
        <input
          type="text"
          className="form-control"
          placeholder="E.g. Example.cs"
          value={exampleFilename}
          onChange={(e) => setExampleFilename(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input type="submit" value="Submit" />
      </div>
    </form>
  )
}
