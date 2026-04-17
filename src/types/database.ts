export type DenunciaStatus = "aberta" | "em_analise" | "resolvida";

export type Profile = {
  id: string;
  nome: string;
  email: string;
  foto_url: string | null;
  created_at: string;
};

export type Categoria = {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

export type Denuncia = {
  id: string;
  user_id: string;
  categoria_id: number;
  titulo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  endereco: string | null;
  foto_url: string | null;
  status: DenunciaStatus;
  created_at: string;
  updated_at: string;
};

export type DenunciaWithCategoria = Denuncia & {
  categorias: {
    id: number;
    nome: string;
  } | null;
};

export type CreateProfileInput = {
  id: string;
  nome: string;
  email?: string;
  foto_url?: string | null;
};

export type CreateDenunciaInput = {
  user_id: string;
  categoria_id: number;
  titulo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  endereco?: string | null;
  foto_url?: string | null;
};
