import { useCallback } from 'react'
import { useMutableMemoryValue, StoredMemoryValue } from 'use-memory-value'

interface NewExerciseForTrackData {
  exerciseName?: string
  learningObjectives?: string
  outOfScope?: string
  concepts?: string
  prerequisites?: string
  story?: string
  tasks?: string
  example?: string
  issueUrl?: string
  introduction?: string
}

interface NewExerciseData {
  [trackId: string]: NewExerciseForTrackData
}

const NEW_EXERCISE_DATA = new StoredMemoryValue<NewExerciseData>(
  `exercism.new_exercise`
)

function useNewExerciseField<K extends keyof NewExerciseForTrackData>(
  trackId: TrackIdentifier,
  field: K
): [NewExerciseForTrackData[K], (value: NewExerciseForTrackData[K]) => void] {
  const [newExercise, setNewExercise] = useMutableMemoryValue(NEW_EXERCISE_DATA)

  const setter = useCallback(
    (value: NewExerciseForTrackData[K]) => {
      setNewExercise((prev) => {
        return {
          ...prev,
          [trackId]: { ...(prev?.[trackId] || {}), [field]: value },
        }
      })
    },
    [trackId, field, setNewExercise]
  )

  return [newExercise?.[trackId]?.[field], setter]
}

export const useExerciseName = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'exerciseName')
export const useLearningObjectives = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'learningObjectives')
export const useOutOfScope = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'outOfScope')
export const useConcepts = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'concepts')
export const usePrerequisites = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'prerequisites')
export const useStory = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'story')
export const useTasks = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'tasks')
export const useExample = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'example')
export const useIssueUrl = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'issueUrl')
export const useIntroduction = (trackId: TrackIdentifier) =>
  useNewExerciseField(trackId, 'introduction')
