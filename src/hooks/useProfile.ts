import useSWR from 'swr'
import { getProfileByUserId } from '../services/profiles'
import type { Profile } from '../types/database'
import { swrKeys } from '../utils/swrKeys'

export function useProfile(userId?: string) {
  const key = userId ? swrKeys.profile(userId) : null

  const { data, error, isLoading, mutate } = useSWR<Profile | null>(
    key,
    () => getProfileByUserId(userId as string)
  )

  return {
    profile: data,
    isLoading,
    error,
    mutate,
  }
}