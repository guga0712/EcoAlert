import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import type { DenunciaWithCategoria } from '../types/database'
import { swrKeys } from '../utils/swrKeys'

async function fetchDenuncias(): Promise<DenunciaWithCategoria[]> {
  const { data, error } = await supabase
    .from('denuncias')
    .select(`
      *,
      categorias (
        id,
        nome
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as DenunciaWithCategoria[]
}

export function useDenuncias() {
  const { data, error, isLoading, mutate } = useSWR(
    swrKeys.denuncias,
    fetchDenuncias
  )

  return {
    denuncias: data ?? [],
    isLoading,
    error,
    mutate,
  }
}