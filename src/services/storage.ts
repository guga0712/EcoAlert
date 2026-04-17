import { supabase } from '../lib/supabase'

type UploadDenunciaImageInput = {
  file: ArrayBuffer
  fileExtension?: string
  contentType?: string
}

export async function uploadDenunciaImage({
  file,
  fileExtension = 'jpg',
  contentType = 'image/jpeg',
}: UploadDenunciaImageInput): Promise<string> {
  const fileName = `denuncia-${Date.now()}.${fileExtension}`

  const { error: uploadError } = await supabase.storage
    .from('denuncias')
    .upload(fileName, file, {
      contentType,
      upsert: false,
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('denuncias')
    .getPublicUrl(fileName)

  return data.publicUrl
}