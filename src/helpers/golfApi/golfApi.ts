import { Tour, Fixture, TournamentInfo, AvailablePlayerMap, LeaderboardEntry } from '../../types'
import mockTours from '../../hardcodedContent/tours'
import mockFixtures from '../../hardcodedContent/fixtures'
import playersMock from '../../hardcodedContent/players'
import leaderboardMock from '../../hardcodedContent/leaderboard'

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_ENV === 'mock'

const API_HOST = 'golf-leaderboard-data.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}`

function apiHeaders() {
  return {
    'x-rapidapi-key': process.env.NEXT_PUBLIC_API_KEY!,
    'x-rapidapi-host': API_HOST,
  }
}

export async function getTours(): Promise<Tour[]> {
  if (IS_MOCK) return mockTours

  const res = await fetch(`${BASE_URL}/tours`, {
    method: 'GET',
    headers: apiHeaders(),
  })
  const data: { results: Tour[] } = await res.json()
  return data.results
}

export async function getFixtures(tourId: string | number, seasonId: number): Promise<Fixture[]> {
  if (IS_MOCK) return mockFixtures

  const res = await fetch(`${BASE_URL}/fixtures/${tourId}/${seasonId}`, {
    method: 'GET',
    headers: apiHeaders(),
  })
  const data: { results: Fixture[] } = await res.json()
  return data.results
}

export async function getEntryList(tournamentId: string | number): Promise<{
  tournament: TournamentInfo
  entry_list: AvailablePlayerMap
}> {
  if (IS_MOCK) {
    return {
      tournament: playersMock.results.tournament as unknown as TournamentInfo,
      entry_list: Object.assign({}, playersMock.results.entry_list) as unknown as AvailablePlayerMap,
    }
  }

  const res = await fetch(`${BASE_URL}/entry-list/${tournamentId}`, {
    method: 'GET',
    headers: apiHeaders(),
  })
  const data: { results: { tournament: TournamentInfo; entry_list: AvailablePlayerMap } } = await res.json()
  return {
    tournament: data.results.tournament,
    entry_list: Object.assign({}, data.results.entry_list),
  }
}

export async function getLeaderboard(tournamentId: string | number): Promise<LeaderboardEntry[]> {
  if (IS_MOCK) return leaderboardMock.leaderboard

  const res = await fetch(`${BASE_URL}/leaderboard/${tournamentId}`, {
    method: 'GET',
    headers: apiHeaders(),
  })
  const data: { results: { leaderboard: LeaderboardEntry[] } } = await res.json()
  return data.results.leaderboard
}
