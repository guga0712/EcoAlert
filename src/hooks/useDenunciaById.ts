import useSWR from 'swr'
import { supabase } from '../lib/supabase'
import type { DenunciaWithCategoria } from '../types/database'
import { swrKeys } from '../utils/swrKeys'

async function fetchDenunciaById(id: string): Promise<DenunciaWithCategoria | null> {
  const { data, error } = await supabase
    .from('denuncias')
    .select(`
      *,
      categorias (
        id,
        nome
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as DenunciaWithCategoria | null
}

export function useDenunciaById(id?: string) {
  const key = id ? swrKeys.denunciaById(id) : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => fetchDenunciaById(id as string)
  )

  return {
    denuncia: data,
    isLoading,
    error,
    mutate,
  }
}