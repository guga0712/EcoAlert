# EcoAlert

App mobile com foco em denuncias ambientais, construido com Expo + React Native e backend no Supabase.

## O que o projeto faz hoje

- lista denuncias com dados vindos do Supabase;
- cadastra novas denuncias;
- registra usuarios via Supabase Auth;
- possui base para perfil de usuario e categorias;
- utiliza cache de dados com SWR.

> Status: MVP em desenvolvimento ativo.

## Stack

- Expo (SDK 54) + React Native
- Expo Router (file-based routing)
- TypeScript
- Tamagui (UI)
- SWR (fetching e cache)
- Supabase (`@supabase/supabase-js`)
- ESLint (`expo lint`)

## Estrutura do projeto

```txt
src/
  app/          # rotas do expo-router
  screens/      # telas de dominio (login, perfil, detalhes)
  hooks/        # hooks de dados (SWR)
  services/     # integracao com Supabase (auth, perfil, denuncias)
  lib/          # clientes compartilhados
  types/        # tipos de dominio/banco
  components/   # componentes reutilizaveis de UI
```

## Requisitos

- Node.js 18+
- npm 9+
- conta/projeto no Supabase

## Configuracao de ambiente

Crie um arquivo `.env` na raiz:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

Depois instale as dependencias:

```bash
npm install
```

## Rodando o app

```bash
npm run start
```

Comandos uteis:

- `npm run android`
- `npm run ios`
- `npm run web`

## Scripts

- `npm run start`: inicia o Expo dev server
- `npm run android`: abre no Android
- `npm run ios`: abre no iOS
- `npm run web`: abre no navegador
- `npm run lint`: executa lint
- `npm run reset-project`: reseta o projeto base do template

## Integracao com Supabase

Cliente central: `src/lib/supabase.ts`.

Camadas de servico:

- `src/services/auth.ts`: sign up, sign in, sign out e usuario atual
- `src/services/profiles.ts`: leitura e atualizacao de perfil
- `src/services/denuncias.ts`: criacao, atualizacao de status e remocao de denuncias

## Boas praticas

- rode `npm run lint` antes de commit/PR;
- nao versionar secrets;
- mantenha regras de negocio em `services/` e consumo em `hooks/`.

## Proximos passos sugeridos

- formulario completo de criacao de denuncia;
- upload de imagem para storage;
- filtros por categoria/status;
- fluxo de autenticacao completo na UI.
