import { reducer } from './reducer'
import { AppState, AppAction } from '../src/types'

const initialState: AppState = {
  userData: { displayName: null },
  isLoggedIn: false,
  userDrafts: null,
}

describe('reducer', () => {
  it('SET_USER_DATA updates userData and leaves other state untouched', () => {
    const user = { uid: '123', displayName: 'Alice', email: 'a@b.com', photoURL: '' }
    const action: AppAction = { type: 'SET_USER_DATA', payload: user }
    const next = reducer(initialState, action)

    expect(next.userData).toEqual(user)
    expect(next.isLoggedIn).toBe(false)
    expect(next.userDrafts).toBeNull()
  })

  it('SET_LOGGED_IN updates isLoggedIn', () => {
    const action: AppAction = { type: 'SET_LOGGED_IN', payload: true }
    const next = reducer(initialState, action)

    expect(next.isLoggedIn).toBe(true)
    expect(next.userData).toEqual(initialState.userData)
  })

  it('SET_USER_DRAFT_DATA updates userDrafts', () => {
    const draftData = {
      email: 'a@b.com',
      displayName: 'Alice',
      drafts: { 'draft-1': { draftName: 'Masters 2024' } },
    }
    const action: AppAction = { type: 'SET_USER_DRAFT_DATA', payload: draftData }
    const next = reducer(initialState, action)

    expect(next.userDrafts).toEqual(draftData)
    expect(next.isLoggedIn).toBe(false)
  })

  it('SET_USER_DRAFT_DATA works when drafts is null', () => {
    const draftData = { email: 'a@b.com', displayName: 'Alice', drafts: null }
    const action: AppAction = { type: 'SET_USER_DRAFT_DATA', payload: draftData }
    const next = reducer(initialState, action)

    expect(next.userDrafts).toEqual(draftData)
  })

  it('does not mutate the previous state object', () => {
    const stateBefore = { ...initialState }
    const action: AppAction = { type: 'SET_LOGGED_IN', payload: true }
    reducer(initialState, action)

    expect(initialState).toEqual(stateBefore)
  })

  it('throws on an unknown action type', () => {
    const action = { type: 'UNKNOWN_ACTION' } as unknown as AppAction
    expect(() => reducer(initialState, action)).toThrow('Invalid action type dispatched')
  })
})
