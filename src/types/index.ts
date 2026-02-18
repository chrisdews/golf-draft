import React from 'react'

// ─── Firebase Auth User (subset used by the app) ─────────────────────────────
export interface User {
  uid: string
  displayName: string
  email: string
  photoURL: string
}

// Logged-out state: only displayName: null is present
export type UserData = User | { displayName: null }

export const isAuthenticatedUser = (userData: UserData): userData is User =>
  'uid' in userData && userData.displayName !== null

// ─── Draft participant ────────────────────────────────────────────────────────
export interface DraftUser {
  id: string
  displayName: string
  role: 'admin' | 'user'
  draftOrderWeight: number
}

// ─── Tournament player from the entry list ────────────────────────────────────
export interface AvailablePlayer {
  player_id: number
  first_name: string
  last_name: string
  country: string
  selectedBy?: { username: string; userId: string }
}

// Firebase stores available players as a keyed object { "0": {...}, "1": {...} }
export type AvailablePlayerMap = Record<string, AvailablePlayer>

// ─── A draft pick stored in Firebase ─────────────────────────────────────────
export interface SelectedPlayer {
  id: string
  pick: number
  userId: string
  username: string
  player_country?: string
  player_first_name?: string
  player_last_name?: string
  player_id?: number
}

// ─── Draft metadata ───────────────────────────────────────────────────────────
export interface DraftInfo {
  draftName: string
  currentPick: number
  draftFinished: boolean
  tourRef: string
  tournamentId: string
}

// ─── Tournament from the entry list API ──────────────────────────────────────
export interface TournamentInfo {
  id: number
  name: string
  course: string
  country: string
  start_date: string
  end_date: string
  type: string
  prize_fund: string
  fund_currency: string
  timezone: string
}

// ─── Live leaderboard ─────────────────────────────────────────────────────────
export interface Round {
  round_number: number
  course_number: number
  position_round: number
  tee_time_local: string
  total_to_par: number
  strokes: number
  updated: string
}

export interface LeaderboardEntry {
  position: number
  player_id: number
  first_name: string
  last_name: string
  country: string
  holes_played: number
  current_round: number
  status: string
  strokes: number
  total_to_par: number
  prize_money: string
  ranking_points: string
  updated: string
  rounds: Round[]
}

// ─── RapidAPI tours endpoint ──────────────────────────────────────────────────
export interface Tour {
  tour_id: string | number
  season_id: number
  tour_name: string
  active: boolean
}

// ─── RapidAPI fixtures/tournaments endpoint ───────────────────────────────────
export interface Fixture {
  id: string | number
  name: string
  start_date: string
  end_date: string
  type: string
  course: string
  country: string
}

// ─── Firebase user record ─────────────────────────────────────────────────────
export interface UserFirebaseData {
  email: string
  displayName: string
  drafts: Record<string, { draftName: string }> | null
}

// ─── Context / State ──────────────────────────────────────────────────────────
export interface AppState {
  userData: UserData
  isLoggedIn: boolean
  // The full Firebase user record (email, displayName, drafts map)
  userDrafts: UserFirebaseData | null
}

export type AppAction =
  | { type: 'SET_USER_DATA'; payload: UserData }
  | { type: 'SET_LOGGED_IN'; payload: boolean }
  | { type: 'SET_USER_DRAFT_DATA'; payload: UserFirebaseData }

export interface ContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}
