# EcoAlert

Aplicativo mobile feito com Expo + React Native para registro e acompanhamento de denuncias ambientais.

## Visao geral

O EcoAlert conecta cidadas e cidadaos a um fluxo simples de denuncia, permitindo:

- listar denuncias por ordem de criacao;
- consultar categorias ativas;
- autenticar usuarios via Supabase Auth;
- criar e atualizar dados de perfil;
- preparar criacao/gestao de denuncias com persistencia no Supabase.

## Stack principal

- Expo (SDK 54) + React Native
- Expo Router (rotas baseadas em arquivos)
- TypeScript
- Supabase (`@supabase/supabase-js`)
- SWR (cache e revalidacao de dados)
- ESLint (via `expo lint`)

## Estrutura de pastas

```txt
src/
  app/          # rotas com expo-router
  screens/      # telas de dominio (login, perfil, detalhes)
  hooks/        # hooks de dados (SWR + Supabase)
  services/     # camada de acesso a dados/autenticacao
  lib/          # clientes compartilhados (supabase client)
  types/        # tipos de dominio e banco
  components/   # componentes reutilizaveis
```

## Requisitos

- Node.js 18+
- npm 9+
- Expo CLI (opcional, pode usar `npx expo`)
- Projeto Supabase configurado

## Configuracao do ambiente

1. Crie (ou ajuste) o arquivo `.env` na raiz:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

2. Instale as dependencias:

```bash
npm install
```

## Como rodar

```bash
npm run start
```

Atalhos uteis:

- `npm run android` para abrir no Android
- `npm run ios` para abrir no iOS
- `npm run web` para abrir no navegador

## Scripts disponiveis

- `npm run start` inicia o projeto com Expo
- `npm run android` inicia com alvo Android
- `npm run ios` inicia com alvo iOS
- `npm run web` inicia com alvo Web
- `npm run lint` executa o lint
- `npm run reset-project` reseta estrutura base do template Expo

## Integracao com Supabase

O cliente do Supabase fica centralizado em `src/lib/supabase.ts` e e consumido por servicos como:

- `src/services/auth.ts` (cadastro, login, logout, usuario atual)
- `src/services/profiles.ts` (consulta/atualizacao de perfil)
- `src/services/denuncias.ts` (criacao/atualizacao/remocao de denuncias)

## Qualidade e boas praticas

- Execute `npm run lint` antes de abrir PR.
- Nao versione secrets ou chaves privadas.
- Prefira organizar novas regras de negocio em `services/` e consumo em `hooks/`.

## Roadmap (sugestao)

- formulario completo de criacao de denuncia;
- upload de imagens para storage;
- filtros por status/categoria;
- notificacoes e acompanhamento de andamento da denuncia.
