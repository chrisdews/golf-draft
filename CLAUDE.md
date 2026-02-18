# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start development server (Next.js)
yarn build        # Build + export static site (next build && next export)
yarn deploy       # Deploy to Firebase Hosting (firebase deploy --only hosting)
```

There is no test runner configured (jest is listed in package.json but no test scripts exist).

## Architecture Overview

This is a **golf fantasy draft** app built with Next.js 12 (static export) + Firebase Realtime DB + Ant Design 4.

### State Management

Global state lives in `context/provider.tsx` (useReducer + Context API). The shape is defined in `AppState` in `src/types/index.ts`:

- `userData: UserData` — either an authenticated `User` or `{ displayName: null }`. Always use the `isAuthenticatedUser()` type guard before accessing `.uid` or `.photoURL`.
- `isLoggedIn: boolean`
- `userDrafts: UserFirebaseData | null` — full Firebase user record including the `.drafts` map.

Actions are dispatched via `AppAction` discriminated union: `SET_USER_DATA`, `SET_LOGGED_IN`, `SET_USER_DRAFT_DATA`.

### Firebase

Firebase 8 namespace API (compat). Initialized in `src/helpers/firebaseInit/firebaseInit.ts`, returns `firebase.database.Database`. Google auth is in `src/helpers/firebaseLogin/firebaseLogin.ts`.

**Database structure:**
```
users/{userId}/          → UserFirebaseData (email, displayName, drafts map)
drafts/{draftId}/        → DraftInfo + picks[] + availablePlayers + users map
```

`availablePlayers` is stored as a Firebase keyed object (`{ "0": {...}, "1": {...} }`), not a JS array — always iterate with `Object.values()`, never `.length`. `.on('value')` listeners are not cleaned up on unmount (known issue).

### Data Flow

1. Google sign-in → auth user stored in Context
2. User record fetched/created in Firebase → `userDrafts` set in Context
3. Components attach `.on('value')` listeners directly for draft-level data
4. RapidAPI (`NEXT_PUBLIC_API_KEY`) provides golf tour/tournament/leaderboard data

### Pages & Components

Pages in `pages/` are thin — they import and render the matching component from `src/components/`. The main draft UI lives in `pages/draft/[draftid].tsx` (dynamic route). `pages/_app.tsx` wraps everything in `ContextProvider` and `LayoutWrapper`.

Each component lives in `src/components/{componentName}/` with its own `index.ts` re-export. `src/types/index.ts` is the single source of truth for all domain types.

### Environment Variables

All `NEXT_PUBLIC_` prefixed. Firebase keys use `!` non-null assertion throughout. Set `NEXT_PUBLIC_MOCK_ENV=mock` to use hardcoded data from `src/hardcodedContent/` instead of live APIs.

### TypeScript

`allowJs: true` — JS files coexist during ongoing migration. Strict mode is on.
