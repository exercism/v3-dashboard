import React, { useState, FormEvent } from 'react'

export interface TrackNewExerciseProps {
  trackId: TrackIdentifier
}

export function TrackNewExercise({
  trackId,
}: TrackNewExerciseProps): JSX.Element {
  const defaultDesign = `## Goal

<!-- TODO: fill in the Concept of the exercise -->

The goal of this exercise is to teach the student the Concept of X.

## Learning objectives

<!-- TODO: specify the learning objectives of the exercise -->

- Know about X
- Know how to use X
- ...

## Out of scope

<!-- TODO: specify the things that are out of scope of the exercise -->

- Memory characteristics of X
- Using X in situation Y
- ...

## Concepts

<!-- TODO: list the concept(s) of the exercise. Usually there is only one concept and the concept matches the exercise name. -->

- \`concept-x\`: know about X; know how to use X

## Prequisites

<!-- TODO: list the prerequisite concept(s) of the exercise, which are the concepts the student will have to be familiar with in order to be able to solve the exercise. All but the very first exercise must have at least one prerequisite. -->

- \`prerequisite-1\`: know how to use A
- \`prerequisite-2\`: know how to work with B
- ...`

  const defaultInstructions = `<!-- TODO: add the story/theme of the exercise -->

<!-- TODO: add the tasks of the exercise -->`

  const defaultExample = `TODO: add idiomatic example implementation of the instructions' tasks`

  const [exerciseName, setExerciseName] = useState('')
  const [design, setDesign] = useState(defaultDesign)
  const [instructions, setInstructions] = useState(defaultInstructions)
  const [example, setExample] = useState(defaultExample)
  const [exampleFilename, setExampleFilename] = useState('')
  const [cliToken, setCliToken] = useState('')
  const [posting, setPosting] = useState(false)
  const [pullRequestUrl, setPullRequestUrl] = useState('')

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    setPosting(true)

    fetch('http://lvh.me:3000/api/maintaining/concept_exercises', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token token=${cliToken}`,
      },
      body: JSON.stringify({
        exercise_track: trackId,
        exercise_slug: exerciseName,
        example_filename: exampleFilename,
        example_code: example,
        instructions_markdown: instructions,
        design_markdown: design,
      }),
    })
      .then((response) => response.json())
      .then((data) =>
        setPullRequestUrl(
          `https://github.com/exercism/v3/compare/master...${data.branch_name}?expand=1`
        )
      )
      .catch(() => setPosting(false))
      .finally(() => setPosting(false))
  }

  if (pullRequestUrl) {
    window.location.replace(pullRequestUrl)
  }

  if (posting) {
    return (
      <div className="d-flex flex-wrap align-items-center mt-4 mb-4 row">
        <div className="col-12 mb-2">
          <p>Creating new exercise...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-wrap align-items-center mt-4 mb-4 row">
      <div className="col-12 mb-2">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Exercise name</label>
            <input
              type="text"
              className="form-control"
              placeholder="E.g. method-overloading"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              The exercise's name, which should reflect the{' '}
              <a href="https://github.com/exercism/v3/blob/master/docs/concept-exercises.md#what-do-we-mean-by-concepts">
                Concept
              </a>{' '}
              the exercise aims to teach. It should be in snake-case and adhere
              to{' '}
              <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/determining-concepts.md#naming-concepts">
                the concept naming rules
              </a>
              .
            </small>
          </div>
          <div className="form-group">
            <label>Design</label>
            <textarea
              className="form-control"
              rows={8}
              value={design}
              onChange={(e) => setDesign(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              Describe the exercise's design, which includes its goal, learning
              objectives, prerequisites, and more. Markdown should be used to
              format the document. Check out{' '}
              <a href="https://github.com/exercism/v3/blob/master/docs/concept-exercises.md#metadesignmd">
                the documentation
              </a>
              ,{' '}
              <a href="https://www.youtube.com/watch?v=gkbBqd7hPrA&t=870">
                this video
              </a>{' '}
              or this{' '}
              <a href="https://github.com/exercism/v3/blob/master/languages/fsharp/exercises/concept/arrays/.meta/design.md">
                example design document
              </a>{' '}
              for more information .
            </small>
          </div>
          <div className="form-group">
            <label>Instructions</label>
            <textarea
              className="form-control"
              rows={8}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              The instructions for the exercise. It contains two parts. The
              first part explains the "story" or "theme" of the exercise. It
              should generally contain no code samples. The second part provides
              clear instructions of what a student needs to do to, in the form
              of one or more tasks. Markdown should be used to format the
              document. Check out{' '}
              <a href="https://github.com/exercism/v3/blob/master/docs/concept-exercises.md#docsinstructionsmd">
                the documentation
              </a>
              ,{' '}
              <a href="https://www.youtube.com/watch?v=gkbBqd7hPrA&t=309">
                this video
              </a>{' '}
              or this{' '}
              <a href="https://github.com/exercism/v3/blob/master/languages/fsharp/exercises/concept/arrays/.docs/instructions.md">
                example instruction document
              </a>{' '}
              for more information .
            </small>
          </div>
          <div className="form-group">
            <label>Example implementation</label>
            <textarea
              className="form-control"
              rows={8}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              An example implementation of the tasks from the instructions. The
              implementation must be idiomatic and be as simple as possible.
              Only use language features introduced by the exercise or its
              prerequisites (and their prerequisites, and so on). Check out{' '}
              <a href="https://github.com/exercism/v3/blob/master/docs/concept-exercises.md#example-implementation-file">
                the documentation
              </a>
              ,{' '}
              <a href="https://www.youtube.com/watch?v=gkbBqd7hPrA&t=781">
                this video
              </a>{' '}
              or this{' '}
              <a href="https://github.com/exercism/v3/blob/master/languages/fsharp/exercises/concept/arrays/.meta/Example.fs">
                example document
              </a>{' '}
              for more information .
            </small>
          </div>
          <div className="form-group">
            <label>Example implementation filename</label>
            <input
              type="text"
              className="form-control"
              placeholder="E.g. Example.js"
              value={exampleFilename}
              onChange={(e) => setExampleFilename(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              The file name of the example implementation file. The name part
              should equal "Example" (in the track's preferred casing) and the
              extension part should match your track's code files extension.
            </small>
          </div>
          <div className="form-group">
            <label>Exercism CLI token</label>
            <input
              type="text"
              className="form-control"
              placeholder="E.g. aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
              value={cliToken}
              onChange={(e) => setCliToken(e.target.value)}
              required
            />
            <small className="form-text text-muted">
              The token is used to associate the pull request that will be
              created with your account. You can find your CLI token by going to{' '}
              <a href="https://exercism.io/my/settings">
                the settings page on exercism.io
              </a>{' '}
              or by running <code>exercism configure</code> and examining its
              output.
            </small>
          </div>
          <div className="form-group">
            <input type="submit" value="Submit" />
          </div>
        </form>
      </div>
    </div>
  )
}
