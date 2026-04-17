import { supabase } from '../lib/supabase'

type SignUpInput = {
  nome: string
  email: string
  password: string
}

type SignInInput = {
  email: string
  password: string
}

export async function signUp({ nome, email, password }: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  const user = data.user

  if (!user) {
    throw new Error('Usuário não retornado no cadastro.')
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    nome,
    email: user.email ?? email,
  })

  if (profileError) {
    throw profileError
  }

  return data
}

export async function signIn({ email, password }: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data.user
}