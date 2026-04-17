import useSWR from "swr";
import { supabase } from "../lib/supabase";
import type { Categoria } from "../types/database";
import { swrKeys } from "../utils/swrKeys";

async function fetchCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Categoria[];
}

export function useCategorias() {
  const { data, error, isLoading, mutate } = useSWR(
    swrKeys.categorias,
    fetchCategorias,
  );

  return {
    categorias: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
