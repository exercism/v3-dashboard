import { useCallback } from 'react'
import { useMutableMemoryValue, StoredMemoryValue } from 'use-memory-value'

interface NewExerciseData {
  exerciseName?: string
  learningObjectives?: string
  outOfScope?: string
  concepts?: string
  prerequisites?: string
  story?: string
  tasks?: string
  example?: string
}

const NEW_EXERCISE_DATA = new StoredMemoryValue<NewExerciseData>(
  `exercism.new_exercise`
)

const [newExercise, setNewExercise] = useMutableMemoryValue(NEW_EXERCISE_DATA)

function userNewExerciseField(
  field: keyof NewExerciseData
): [string | undefined, (value: string) => void] {
  const setter = useCallback(
    (value: string) => {
      setNewExercise((prev) => {
        return { ...(prev || {}), [field]: value }
      })
    },
    [setNewExercise]
  )

  return [newExercise?.[field], setter]
}

export const useExerciseName = userNewExerciseField('exerciseName')
export const useLearningObjectives = userNewExerciseField('learningObjectives')
export const useOutOfScope = userNewExerciseField('outOfScope')
export const useConcepts = userNewExerciseField('concepts')
export const usePrerequisites = userNewExerciseField('prerequisites')
export const useStory = userNewExerciseField('story')
export const useTasks = userNewExerciseField('tasks')
export const useExample = userNewExerciseField('example')
