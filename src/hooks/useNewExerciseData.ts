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

function useNewExerciseField<K extends keyof NewExerciseData>(
  field: K
): [NewExerciseData[K], (value: NewExerciseData[K]) => void] {
  const setter = useCallback(
    (value: NewExerciseData[K]) => {
      setNewExercise((prev) => {
        return { ...(prev || {}), [field]: value }
      })
    },
    [field, setNewExercise]
  )

  return [newExercise?.[field], setter]
}

export const useExerciseName = () => useNewExerciseField('exerciseName')
export const useLearningObjectives = () =>
  useNewExerciseField('learningObjectives')
export const useOutOfScope = () => useNewExerciseField('outOfScope')
export const useConcepts = () => useNewExerciseField('concepts')
export const usePrerequisites = () => useNewExerciseField('prerequisites')
export const useStory = () => useNewExerciseField('story')
export const useTasks = () => useNewExerciseField('tasks')
export const useExample = () => useNewExerciseField('example')
