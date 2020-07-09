import React from 'react'

import { LoadingIndicator } from './LoadingIndicator'
import { Error } from './Error'
import {
  useStories,
  StoryConcept,
  StoryImplementation,
  Story,
} from '../hooks/useStories'

export function Stories(): JSX.Element {
  const { result, loading, error } = useStories()

  if (loading) {
    return <LoadingIndicator />
  }

  if (error) {
    return <Error>There was an error loading the stories.</Error>
  }

  const stories = result!.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <section>
      <p>These are all the stories that been implemented in V3 tracks.</p>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Story</th>
            <th scope="col">Concept</th>
            <th scope="col">Implementations</th>
          </tr>
        </thead>
        <tbody>
          {stories.map((story) => (
            <tr key={story.url}>
              <td>
                <StoryLink story={story} />
              </td>
              <td>
                <StoryConceptLink concept={story.concept} />
              </td>
              <td>
                {story.implementations.map((implementation, index) => (
                  <span key={index}>
                    {index > 0 ? ', ' : ''}
                    <StoryImplementationLink implementation={implementation} />
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

interface StoryConceptLinkProps {
  concept: StoryConcept
}

function StoryConceptLink({ concept }: StoryConceptLinkProps) {
  return (
    <a href={concept.url} title={concept.name}>
      {concept.name}
    </a>
  )
}

interface StoryLinkProps {
  story: Story
}

function StoryLink({ story }: StoryLinkProps) {
  return (
    <a href={story.url} title={story.name}>
      {story.name}
    </a>
  )
}

interface StoryImplementationLinkProps {
  implementation: StoryImplementation
}

function StoryImplementationLink({
  implementation,
}: StoryImplementationLinkProps) {
  return (
    <a href={implementation.url} title={implementation.exercise}>
      {implementation.track}
    </a>
  )
}
