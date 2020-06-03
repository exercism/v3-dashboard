import { useCallback } from 'react'
import { useMutableMemoryValue, StoredMemoryValue } from 'use-memory-value'

interface UserData {
  cliToken?: string
}

const USER_DATA = new StoredMemoryValue<UserData>(`exercism.user`)

const [user, setUser] = useMutableMemoryValue(USER_DATA)

function useUserField(
  field: keyof UserData
): [string | undefined, (value: string) => void] {
  const setter = useCallback(
    (value: string) => {
      setUser((prev) => {
        return { ...(prev || {}), [field]: value }
      })
    },
    [setUser]
  )

  return [user?.[field], setter]
}

export const useCliToken = useUserField('cliToken')
