Here's my assessment as a fullstack architect:

  ---
  What It Is

  A real-time multiplayer golf drafting game — users join a draft room, take turns picking PGA Tour golfers competing in a live tournament,
  then track their picks against a live leaderboard. Think fantasy football pick-em, golf edition.

  Stack: Next.js 12 + Firebase Realtime DB + Ant Design + RapidAPI (golf data)

  ---
  Strengths

  Solid concept-to-ship execution. For a side project, it gets the core loop right: auth → create draft → join → real-time pick turns → live
  leaderboard. Firebase Realtime DB is a reasonable choice here — it gives you live sync across users without building a WebSocket server.

  Component organization is clean and feature-aligned (availablePlayers/, liveLeaderboard/, draftHistory/). Easy to navigate.

  Mock data support (NEXT_PUBLIC_MOCK_ENV) is a good dev practice that's often skipped.

  ---
  Issues Worth Fixing

  1. Security — this is the most urgent one

  // database.rules.json
  { ".read": "auth != true" }

  This reads "allow read if user is NOT authenticated" — it's likely backwards (auth != null is the standard pattern). Your database is
  effectively public-read. The Firestore rules also expired in 2021.

  2. Tech debt: Next.js 12 / React 17

  You're two major versions behind on Next.js (15 is current). The next export static export pattern was deprecated — App Router with server
  components would give you better performance and cleaner data fetching.

  3. Firebase listeners not cleaned up properly

  Real-time .on('value') listeners in useEffect hooks without proper .off() cleanup = memory leaks and potentially multiple listeners stacking
  across re-renders. This is a common Firebase + React bug.

  4. Error handling is surface-level

  Most .catch() blocks just console.error. Users see nothing when the API fails. At minimum, display error states in the UI.

  5. API key exposure

  NEXT_PUBLIC_API_KEY is intentionally client-side, but if this is a paid RapidAPI plan, there's no rate-limiting or token scoping. A
  server-side API route would proxy requests and hide the key.

  6. useEffect dependency arrays

  Several effects likely have missing deps, leading to stale closures — particularly risky in the draft room where pick state changes
  frequently.

  ---
  Architectural Observations

  No server-side logic. Everything runs client-side with direct Firebase/API calls. This works but means no place to put business logic
  enforcement (e.g., "is it actually this user's turn?"). A malicious client could pick out of turn. Cloud Functions are set up but unused —
  this is where draft turn enforcement should live.

  Draft ordering via random weight is a pragmatic approach but the logic should be server-enforced, not client-trusted.

  No TypeScript, no prop-types enforcement. For a real-time app with multiple interconnected state updates, types would catch a class of bugs
  at compile time that are currently only visible at runtime.

  ---
  Priority Fix List

  ┌──────────┬──────────────────────────────────────────────────┐
  │ Priority │                      Issue                       │
  ├──────────┼──────────────────────────────────────────────────┤
  │ Critical │ Fix Firebase security rules                      │
  ├──────────┼──────────────────────────────────────────────────┤
  │ High     │ Clean up useEffect listener teardown             │
  ├──────────┼──────────────────────────────────────────────────┤
  │ High     │ Proxy RapidAPI calls through a Next.js API route │
  ├──────────┼──────────────────────────────────────────────────┤
  │ Medium   │ Upgrade Next.js (at minimum to 14, ideally 15)   │
  ├──────────┼──────────────────────────────────────────────────┤
  │ Medium   │ Add real error states in the UI                  │
  ├──────────┼──────────────────────────────────────────────────┤
  │ Low      │ Move draft turn validation to Cloud Functions    │
  ├──────────┼──────────────────────────────────────────────────┤
  │ Low      │ Add TypeScript                                   │
  └──────────┴──────────────────────────────────────────────────┘

  ---
  Bottom line: This is a functional, well-scoped project with a clean domain model. The real-time draft experience is the hard part and it
  mostly works. The gaps are typical of a project that grew organically — security rules, listener cleanup, and error handling are the things
  to tackle before you'd share this with real users.