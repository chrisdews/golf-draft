import { isAuthenticatedUser, UserData } from './index'

describe('isAuthenticatedUser', () => {
  it('returns true for a fully populated authenticated user', () => {
    const user: UserData = {
      uid: 'user-123',
      displayName: 'Alice',
      email: 'alice@example.com',
      photoURL: 'https://example.com/photo.jpg',
    }
    expect(isAuthenticatedUser(user)).toBe(true)
  })

  it('returns false for the logged-out state { displayName: null }', () => {
    const loggedOut: UserData = { displayName: null }
    expect(isAuthenticatedUser(loggedOut)).toBe(false)
  })

  it('narrows the type so uid is accessible after the guard passes', () => {
    const user: UserData = {
      uid: 'uid-456',
      displayName: 'Bob',
      email: 'bob@example.com',
      photoURL: '',
    }
    if (isAuthenticatedUser(user)) {
      // TypeScript should not complain about accessing uid here
      expect(user.uid).toBe('uid-456')
    } else {
      fail('Expected isAuthenticatedUser to return true')
    }
  })
})
