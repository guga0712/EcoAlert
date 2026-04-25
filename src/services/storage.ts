import { supabase } from "../lib/supabase";

type UploadDenunciaImageInput = {
  file: ArrayBuffer;
  fileExtension?: string;
  contentType?: string;
};

export async function uploadDenunciaImage({
  file,
  fileExtension = "jpg",
  contentType = "image/jpeg",
}: UploadDenunciaImageInput): Promise<string> {
  const fileName = `denuncia-${Date.now()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("denuncias")
    .upload(fileName, file, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("denuncias").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadDenunciaImageFromUri(uri: string): Promise<string> {
  const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const fileName = `denuncia-${Date.now()}.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('denuncias')
    .upload(fileName, arrayBuffer, { contentType, upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('denuncias').getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadAvatarImage(
  userId: string,
  uri: string,
): Promise<string> {
  const ext = uri.split(".").pop() ?? "jpg";
  const contentType = ext === "png" ? "image/png" : "image/jpeg";
  const fileName = `${userId}/avatar.${ext}`;

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from("avatares")
    .upload(fileName, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("avatares").getPublicUrl(fileName);

  return `${data.publicUrl}?t=${Date.now()}`;
}
