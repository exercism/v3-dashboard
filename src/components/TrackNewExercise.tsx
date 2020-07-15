import React, { useState, FormEvent, useEffect } from 'react'
import { StaticContext } from 'react-router'
import { useParams, RouteComponentProps, Link } from 'react-router-dom'
import prettier from 'prettier/standalone'
import parserMarkdown from 'prettier/parser-markdown'

import { useTrackData } from '../hooks/useTrackData'
import { useCliToken } from '../hooks/useUserData'
import {
  useOutOfScope,
  useExerciseName,
  useLearningObjectives,
  useConcepts,
  useExample,
  usePrerequisites,
  useStory,
  useTasks,
  useIssueUrl,
  useIntroduction,
} from '../hooks/useNewExerciseData'

import { SubmitIndicator } from './SubmitIndicator'

export interface TrackNewExerciseParams {
  trackId: TrackIdentifier
}

export interface TrackNewExerciseLocationState {
  exerciseName: string | undefined
  learningObjectives: string | undefined
  outOfScope: string | undefined
  concepts: string | undefined
  prerequisites: string | undefined
  issueUrl: string | undefined
}

interface TrackNewExerciseProps
  extends RouteComponentProps<
    {},
    StaticContext,
    TrackNewExerciseLocationState
  > {}

export function TrackNewExercise(props: TrackNewExerciseProps): JSX.Element {
  const { trackId } = useParams<TrackNewExerciseParams>()
  const trackData = useTrackData(trackId)
  const [exerciseName, setExerciseName] = useExerciseName(trackId)
  const [learningObjectives, setLearningObjectives] = useLearningObjectives(
    trackId
  )
  const [outOfScope, setOutOfScope] = useOutOfScope(trackId)
  const [concepts, setConcepts] = useConcepts(trackId)
  const [prerequisites, setPrerequisites] = usePrerequisites(trackId)
  const [story, setStory] = useStory(trackId)
  const [tasks, setTasks] = useTasks(trackId)
  const [example, setExample] = useExample(trackId)
  const [issueUrl, setIssueUrl] = useIssueUrl(trackId)
  const [introduction, setIntroduction] = useIntroduction(trackId)
  const [cliToken, setCliToken] = useCliToken()
  const [posting, setPosting] = useState(false)
  const [pullRequestUrl, setPullRequestUrl] = useState('')
  const [linkToContributing, setLinkToContributing] = useState(false)

  const prepopulate = props.location.state

  const formatMarkdown = (markdown: string | undefined): string | undefined => {
    if (markdown) {
      return prettier.format(markdown, {
        parser: 'markdown',
        plugins: [parserMarkdown],
      })
    }

    return markdown
  }

  const clearState = () => window.history.pushState(null, '')

  useEffect(() => {
    if (!prepopulate) {
      return
    }

    setExerciseName(prepopulate.exerciseName || '')
    setConcepts(prepopulate.concepts || '')
    setPrerequisites(prepopulate.prerequisites || '')
    setOutOfScope(prepopulate.outOfScope || '')
    setLearningObjectives(prepopulate.learningObjectives || '')
    setIssueUrl(prepopulate.issueUrl || '')

    clearState()
  }, [
    prepopulate,
    setExerciseName,
    setConcepts,
    setPrerequisites,
    setOutOfScope,
    setLearningObjectives,
    setIssueUrl,
    setLinkToContributing,
  ])

  useEffect(() => {
    setLinkToContributing(
      (exerciseName === undefined || exerciseName === '') &&
        (concepts === undefined || concepts === '') &&
        (prerequisites === undefined || prerequisites === '') &&
        (outOfScope === undefined || outOfScope === '') &&
        (learningObjectives === undefined || learningObjectives === '') &&
        (issueUrl === undefined || issueUrl === '')
    )
  }, [
    exerciseName,
    concepts,
    prerequisites,
    outOfScope,
    learningObjectives,
    issueUrl,
  ])

  const clearFormData = () => {
    setExerciseName('')
    setLearningObjectives('')
    setOutOfScope('')
    setConcepts('')
    setPrerequisites('')
    setStory('')
    setTasks('')
    setExample('')
    setIssueUrl('')
    setIntroduction('')
  }

  const clearForm = (evt: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    evt.preventDefault()

    if (
      window.confirm(
        'Are you sure you want to clear the data in this form? Note: this will not clear the CLI token'
      )
    ) {
      clearFormData()
    }
  }

  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    setPosting(true)

    const design = [
      '## Learning objectives',
      learningObjectives?.trim(),
      '## Out of scope',
      outOfScope?.trim(),
      '## Concepts',
      concepts?.trim(),
      '## Prerequisites',
      prerequisites?.trim(),
    ].join('\n\n')
    const instructions = `${story?.trim()}\n\n${tasks?.trim()}`.trim()

    fetch(`${process.env.REACT_APP_EXERCISM_HOST}/git_api/concept_exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token token=${cliToken}`,
      },
      body: JSON.stringify({
        track_slug: trackId,
        exercise_slug: exerciseName?.trim(),
        example_filename: trackData.example_filename?.trim(),
        example_code: example,
        instructions_markdown: formatMarkdown(instructions?.trim()),
        introduction_markdown: formatMarkdown(introduction?.trim()),
        design_markdown: formatMarkdown(design?.trim()),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const body = issueUrl ? `Closes ${issueUrl}` : ''
        setPullRequestUrl(
          `https://github.com/exercism/v3/compare/master...exercism-bot:${data.branch_name}?expand=1&body=${body}`
        )
      })
      .catch(() => setPosting(false))
      .finally(() => {
        clearFormData()
        setPosting(false)
      })
  }

  if (posting || pullRequestUrl) {
    if (pullRequestUrl) {
      window.location.replace(pullRequestUrl)
    }

    const postDisplay = {
      message: 'Creating new exercise...',
      step: '1',
    }
    const pullRequestDisplay = {
      message: 'Redirecting to create pull request...',
      step: '2',
    }
    const { message, step } = pullRequestUrl ? pullRequestDisplay : postDisplay
    const totalSteps = '2'

    return (
      <SubmitIndicator message={message} step={step} totalSteps={totalSteps} />
    )
  }

  return (
    <div className="d-flex flex-wrap align-items-center mt-4 mb-4 row">
      <div className="col-12 mb-2">
        {linkToContributing ? (
          <div className="alert alert-primary" role="alert">
            Thanks for wanting to contribute a new exercise! First, please check
            the <Link to={`/${trackId}/contributing`}>Contributing</Link>{' '}
            section to see if there is an open issue for the exercise you want
            to create. If so, please use that issue's "Create exercise" button
            to quickly get started.
          </div>
        ) : (
          <></>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>
              <strong>Design</strong>
            </legend>
            <div className="form-group">
              <p className="form-text">
                Describe the exercise's design, which includes its goal,
                learning objectives, prerequisites, and more. Markdown should be
                used to format the document. Check out{' '}
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
              </p>
            </div>
            <div className="form-group">
              <label>
                <strong>Learning objectives</strong>
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={learningObjectives}
                placeholder="- Know about X&#10;- Know how to use X&#10;- ..."
                onChange={(e) => setLearningObjectives(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <strong>Out of scope</strong>
              </label>
              <textarea
                className="form-control"
                rows={4}
                value={outOfScope}
                placeholder="- Memory characteristics of X&#10;- Using X in situation Y&#10;- ..."
                onChange={(e) => setOutOfScope(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <strong>Concepts</strong>
              </label>
              <textarea
                className="form-control"
                rows={2}
                value={concepts}
                placeholder="- `concept-x`: know about X; know how to use X"
                onChange={(e) => setConcepts(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <strong>Prerequisites</strong>
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={prerequisites}
                placeholder="- `concept-a`: know how to use A&#10;- `concept-b`: know how to work with B&#10;"
                onChange={(e) => setPrerequisites(e.target.value)}
                required
              />
            </div>
          </fieldset>
          <fieldset>
            <legend>
              <strong>Exercise</strong>
            </legend>
            <div className="form-group">
              <label>
                <strong>Exercise name</strong>
              </label>
              <p className="form-text">
                The exercise's name, which should reflect the{' '}
                <a href="https://github.com/exercism/v3/blob/master/docs/concept-exercises.md#what-do-we-mean-by-concepts">
                  Concept
                </a>{' '}
                the exercise aims to teach. It should be in snake-case and
                adhere to{' '}
                <a href="https://github.com/exercism/v3/blob/master/docs/maintainers/determining-concepts.md#naming-concepts">
                  the concept naming rules
                </a>
                .
              </p>
              <input
                type="text"
                className="form-control"
                placeholder="method-overloading"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <strong>Story</strong>
              </label>
              <p className="form-text">
                This is the first half of the instructions.md file. The story
                provides some context around the exercise. It can be be an
                actual story (e.g.{' '}
                <a href="https://github.com/exercism/v3/blob/master/languages/csharp/exercises/concept/classes/.docs/instructions.md">
                  playing with remote-controlled cars
                </a>
                ) or something more programming related (e.g.{' '}
                <a href="https://github.com/exercism/v3/blob/master/languages/csharp/exercises/concept/strings/.docs/instructions.md">
                  parsing log lines
                </a>
                ). This should generally contain no code samples. Markdown
                should be used to format the document. Check out{' '}
                <a href="/stories">the list of already implemented stories,</a>{' '}
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
                for more information.
              </p>
              <textarea
                className="form-control"
                rows={3}
                value={story}
                placeholder="In this exercise you'll be encoding the rules of an RPG game"
                onChange={(e) => setStory(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <strong>Tasks</strong>
              </label>
              <p className="form-text">
                This is the second part of the instruction.md. It provides clear
                instructions of what a student needs to do to, in the form of
                one or more tasks. Each task should show a code snippet of the
                code being run and the expected output. Markdown should be used
                to format the document. Check out{' '}
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
                for more information.
              </p>
              <textarea
                className="form-control"
                rows={5}
                value={tasks}
                placeholder="## 1.  Display the distance driven&#10;Implement the RemoteControlCar.DistanceDisplay() method to return the distance as displayed on the LED display:&#10;```&#10;var car = RemoteControlCar.Buy();&#10;car.DistanceDisplay();&#10;// => 'Driven 0 meters'&#10;```"
                onChange={(e) => setTasks(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <strong>Example implementation</strong>
              </label>
              <p className="form-text">
                Provide an example implementation of the tasks from the
                instructions. The implementation should be the solution we
                ideally want the student to produce, with consideration to the
                knowledge they have via the prerequisites. Only use language
                features introduced by the exercise or its prerequisites (and
                their prerequisites, and so on). Check out{' '}
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
              </p>
              <textarea
                className="form-control"
                rows={5}
                value={example}
                placeholder="Add idiomatic example implementation of the instructions' tasks"
                onChange={(e) => setExample(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <strong>Introduction</strong> (optional)
              </label>
              <p className="form-text">
                Introduce the concept(s) that the exercise teaches to the
                student. The information provided should give the student just
                enough context to figure out the solution themselves. Proper
                technical terms should be used so that the student can easily
                search for more information. Links should be used sparingly, if
                at all. Code examples should only be used to introduce new
                syntax (students should not need to search the web for examples
                of syntax). In other cases provide descriptions or links instead
                of code. Check out{' '}
                <a href="https://github.com/exercism/v3/blob/master/docs/concept-exercises.md#docsintroductionmd">
                  the documentation
                </a>
                ,{' '}
                <a href="https://www.youtube.com/watch?v=gkbBqd7hPrA&t=77">
                  this video
                </a>{' '}
                or this{' '}
                <a href="https://github.com/exercism/v3/blob/master/languages/csharp/exercises/concept/strings/.docs/introduction.md">
                  example introduction document
                </a>{' '}
                for more information .
              </p>
              <textarea
                className="form-control"
                rows={5}
                value={introduction}
                placeholder='A `string` in C# is an object that represents immutable text as a sequence of Unicode characters (letters, digits, punctuation, etc.). Double quotes are used to define a `string` instance:&#10;```csharp&#10;string fruit = "Apple";&#10;```'
                onChange={(e) => setIntroduction(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                <strong>GitHub issue URL</strong> (optional)
              </label>
              <p className="form-text">
                The URL of the GitHub issue describing this exercise. Check out
                the{' '}
                <a href="https://github.com/exercism/v3/issues?q=is%3Aissue+is%3Aopen+label%3Atype%2Fnew-exercise">
                  open new exercise issues
                </a>{' '}
                to see if there is an issue describing this exercise.
              </p>
              <input
                type="url"
                className="form-control"
                value={issueUrl}
                placeholder="https://github.com/exercism/v3/issues/1234"
                onChange={(e) => setIssueUrl(e.target.value)}
              />
            </div>
          </fieldset>
          <div className="form-group">
            <label>
              <strong>Exercism CLI token</strong>
            </label>
            <p className="form-text">
              The token is used to associate the pull request that will be
              created with your account. You can find your CLI token by going to{' '}
              <a href="https://exercism.io/my/settings">
                the settings page on exercism.io
              </a>{' '}
              or by running <code>exercism configure</code> and examining its
              output.
            </p>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
                value={cliToken}
                onChange={(e) => setCliToken(e.target.value)}
                required
              />
              <input
                type="button"
                className="form-control btn btn-danger col-md-2 ml-1"
                onClick={() => setCliToken('')}
                value="Clear token"
              />
            </div>
          </div>
          <div className="form-group">
            <input
              type="submit"
              value="Clear form"
              className="btn btn-warning mr-1 float-right"
              onClick={(e) => clearForm(e)}
            />
            <input
              type="submit"
              value="Create Pull Request"
              className="btn btn-primary"
            />
          </div>
        </form>
      </div>
    </div>
  )
}
