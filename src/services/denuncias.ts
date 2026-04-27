import { supabase } from '../lib/supabase'
import type {
  CreateDenunciaInput,
  Denuncia,
  DenunciaStatus,
} from '../types/database'

export async function createDenuncia(
  input: CreateDenunciaInput
): Promise<Denuncia> {
  const { data, error } = await supabase
    .from('denuncias')
    .insert({
      user_id: input.user_id,
      categoria_id: input.categoria_id,
      titulo: input.titulo,
      descricao: input.descricao,
      latitude: input.latitude,
      longitude: input.longitude,
      endereco: input.endereco ?? null,
      foto_url: input.foto_url ?? null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Denuncia
}

export async function updateDenunciaStatus(
  denunciaId: string,
  status: DenunciaStatus
): Promise<void> {
  const { error } = await supabase
    .from('denuncias')
    .update({ status })
    .eq('id', denunciaId)

  if (error) {
    throw error
  }
}

export async function deleteDenuncia(denunciaId: string): Promise<void> {
  const { error } = await supabase
    .from('denuncias')
    .delete()
    .eq('id', denunciaId)

  if (error) {
    throw error
  }
}