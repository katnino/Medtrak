import { useCallback, useEffect, useState } from 'react'

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => readLS(key, initial))

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full / unavailable — ignore, app still works in-memory
    }
  }, [key, value])

  const update = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const next =
        typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater
      return next
    })
  }, [])

  return [value, update] as const
}
