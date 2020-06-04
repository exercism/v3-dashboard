import { useCallback } from 'react'
import { useMutableMemoryValue, StoredMemoryValue } from 'use-memory-value'

interface UserData {
  cliToken?: string
}

const USER_DATA = new StoredMemoryValue<UserData>(`exercism.user`)

function useUserField<K extends keyof UserData>(
  field: K
): [UserData[K], (value: UserData[K]) => void] {
  const [user, setUser] = useMutableMemoryValue(USER_DATA)

  const setter = useCallback(
    (value: UserData[K]) => {
      setUser((prev) => {
        return { ...(prev || {}), [field]: value }
      })
    },
    [field, setUser]
  )

  return [user?.[field], setter]
}

export const useCliToken = () => useUserField('cliToken')
