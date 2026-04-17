import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import type { DenunciaWithCategoria } from '../types/database'
import { swrKeys } from '../utils/swrKeys'

async function fetchMyDenuncias(userId: string): Promise<DenunciaWithCategoria[]> {
  const { data, error } = await supabase
    .from('denuncias')
    .select(`
      *,
      categorias (
        id,
        nome
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as DenunciaWithCategoria[]
}

export function useMyDenuncias(userId?: string) {
  const key = userId ? swrKeys.myDenuncias(userId) : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => fetchMyDenuncias(userId as string)
  )

  return {
    denuncias: data ?? [],
    isLoading,
    error,
    mutate,
  }
}