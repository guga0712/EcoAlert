# EcoAlert

A mobile app for reporting environmental and urban incidents, built with Expo + React Native and Supabase as the backend.

## Features

- Interactive map showing all reported incidents with category-color-coded markers
- Submit new incident reports with photo upload, geolocation and category
- Detail sheet for each incident (status, description, address, date)
- User authentication via Supabase Auth
- User profile screen
- Data fetching and caching with SWR

> Status: MVP under active development.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 + React Native 0.81 |
| Routing | Expo Router (file-based) |
| Language | TypeScript 5.9 |
| UI library | Tamagui 2 |
| Icons | @tamagui/lucide-icons-2 |
| Map | react-native-maps (Google Maps on Android) |
| Data fetching | SWR 2 |
| Backend / Auth | Supabase (`@supabase/supabase-js`) |
| Image picker | expo-image-picker |
| Location | expo-location |
| Animations | react-native-reanimated + Animated API |
| Linting | ESLint (expo config) |

## Project Structure

```
EcoAlert/
├── app.json                        # Expo app configuration
├── babel.config.js
├── metro.config.js
├── tamagui.config.ts               # Tamagui design system config
├── tsconfig.json
└── src/
    ├── app/                        # Expo Router file-based routes
    │   ├── _layout.tsx             # Root layout (auth guard)
    │   ├── index.tsx               # Entry redirect
    │   ├── login.tsx               # Login route
    │   ├── modal.tsx               # Generic modal route
    │   ├── nova-ocorrencia.tsx     # New incident route
    │   └── (tabs)/
    │       ├── _layout.tsx         # Bottom tab navigator
    │       ├── index.tsx           # Home tab
    │       ├── explore.tsx         # Map tab
    │       └── profile.tsx         # Profile tab
    ├── screens/                    # Full screens consumed by routes
    │   ├── CreateDenunciaScreen.tsx
    │   ├── DetailDenunciaScreen.tsx
    │   ├── LoginScreen.tsx
    │   └── ProfileScreen.tsx
    ├── components/                 # Reusable UI components
    │   ├── Header/
    │   │   └── index.tsx
    │   ├── Title/
    │   │   ├── index.tsx
    │   │   └── Title.types.ts
    │   ├── external-link.tsx
    │   ├── haptic-tab.tsx
    │   ├── parallax-scroll-view.tsx
    │   ├── themed-text.tsx
    │   ├── themed-view.tsx
    │   └── ui/
    │       ├── collapsible.tsx
    │       ├── icon-symbol.ios.tsx
    │       └── icon-symbol.tsx
    ├── hooks/                      # SWR data hooks
    │   ├── useCategorias.ts
    │   ├── useDenunciaById.ts
    │   ├── useDenuncias.ts
    │   ├── useMyDenuncias.ts
    │   ├── useProfile.ts
    │   ├── use-color-scheme.ts
    │   ├── use-color-scheme.web.ts
    │   └── use-theme-color.ts
    ├── services/                   # Supabase integration layer
    │   ├── auth.ts                 # sign-up, sign-in, sign-out, current user
    │   ├── denuncias.ts            # create, update status, delete incidents
    │   ├── profiles.ts             # read and update user profile
    │   └── storage.ts              # image upload to Supabase Storage
    ├── lib/
    │   └── supabase.ts             # Supabase client singleton
    ├── types/
    │   └── database.ts             # Domain / database types
    ├── constants/
    │   └── theme.ts
    ├── utils/
    │   ├── examples.ts
    │   └── swrKeys.ts              # SWR cache key constants
    ├── styles/
    │   └── global.css
    └── assets/
        └── images/
            ├── icon.png
            ├── splash-icon.png
            ├── favicon.png
            ├── android-icon-background.png
            ├── android-icon-foreground.png
            └── android-icon-monochrome.png
```

## Requirements

- Node.js 18+
- npm 9+
- A Supabase project (free tier works fine)
- For Android: Android Studio / physical device
- For iOS: Xcode (macOS only) / physical device

## Environment Setup

Create a `.env` file at the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

Then install dependencies:

```bash
npm install
```

## Running the App

```bash
# Start Expo dev server (scan QR with Expo Go)
npm run start

# Open directly on Android emulator / device
npm run android

# Open directly on iOS simulator / device (macOS only)
npm run ios

# Open in the browser
npm run web
```

## Scripts

| Command | Description |
|---|---|
| `npm run start` | Start the Expo dev server |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS |
| `npm run web` | Start and open in browser |
| `npm run lint` | Run ESLint |
| `npm run reset-project` | Reset to the blank Expo template |

## Key Dependencies

### Runtime

| Package | Purpose |
|---|---|
| `expo` ~54 | Expo SDK and managed workflow |
| `expo-router` ~6 | File-based routing |
| `react-native-maps` 1.20 | Interactive map (Google Maps / Apple Maps) |
| `expo-location` ~19 | GPS / geolocation |
| `expo-image-picker` ~17 | Camera / gallery image selection |
| `expo-image` ~3 | Optimised image component |
| `expo-linear-gradient` ~15 | Gradient backgrounds |
| `@supabase/supabase-js` ^2 | Backend, Auth, Storage client |
| `swr` ^2 | Data fetching and cache |
| `tamagui` ^2 | Design system / UI primitives |
| `@tamagui/lucide-icons-2` ^2 | Icon set |
| `react-native-reanimated` ~4 | Smooth animations |
| `react-native-gesture-handler` ~2 | Native gesture recognition |
| `react-native-safe-area-context` ~5 | Safe area insets |
| `react-native-screens` ~4 | Native screen containers |
| `expo-haptics` ~15 | Haptic feedback |

### Dev

| Package | Purpose |
|---|---|
| `typescript` ~5.9 | Type checking |
| `eslint` + `eslint-config-expo` | Linting |
| `babel-preset-expo` ~54 | Babel transforms |
| `@types/react` ~19 | React type definitions |

## Architecture Overview

```
Route (expo-router)
  └── Screen component (src/screens/)
        ├── Data via SWR hooks (src/hooks/)   ← caches responses
        │     └── Service functions (src/services/)  ← talks to Supabase
        │           └── supabase client (src/lib/supabase.ts)
        └── UI via Tamagui + custom components (src/components/)
```

- **Routes** in `src/app/` are thin — they just render the matching Screen.
- **Screens** hold layout and local state.
- **Hooks** (SWR) own data fetching, caching, and revalidation.
- **Services** are pure async functions; no React inside them.

## Contributing

1. Create a branch from `master`.
2. Run `npm run lint` before opening a PR.
3. Never commit `.env` or any file containing secrets.
