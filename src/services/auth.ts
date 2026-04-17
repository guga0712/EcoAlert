import { supabase } from "../lib/supabase";

type SignUpInput = {
  nome: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

export async function signUp({ nome, email, password }: SignUpInput) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome,
      },
    },
  });

  if (signUpError) {
    throw signUpError;
  }

  const user = signUpData.user;

  if (!user) {
    throw new Error("Usuário não retornado no cadastro.");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    nome,
    email: user.email ?? email,
  });

  if (profileError) {
    throw new Error(
      `Usuário criado no Auth, mas falhou ao criar profile: ${profileError.message}`,
    );
  }

  return {
    user,
    session: signUpData.session,
  };
}

export async function signIn({ email, password }: SignInInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}
