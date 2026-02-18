import sortUsers from './sortUsers'

describe('sortUsers', () => {
  it('converts a Firebase keyed object into an array with the key as id', () => {
    const snapshot = {
      abc: { displayName: 'Alice', role: 'user' as const, draftOrderWeight: 1 },
    }
    const result = sortUsers(snapshot)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('abc')
    expect(result[0].displayName).toBe('Alice')
  })

  it('sorts by draftOrderWeight ascending', () => {
    const snapshot = {
      user1: { displayName: 'Charlie', role: 'user' as const, draftOrderWeight: 3 },
      user2: { displayName: 'Bob', role: 'user' as const, draftOrderWeight: 1 },
      user3: { displayName: 'Alice', role: 'admin' as const, draftOrderWeight: 2 },
    }
    const result = sortUsers(snapshot)
    expect(result.map((u) => u.displayName)).toEqual(['Bob', 'Alice', 'Charlie'])
  })

  it('returns an empty array for an empty snapshot', () => {
    expect(sortUsers({})).toEqual([])
  })

  it('preserves all user fields', () => {
    const snapshot = {
      id99: { displayName: 'Dave', role: 'admin' as const, draftOrderWeight: 5 },
    }
    const [user] = sortUsers(snapshot)
    expect(user).toEqual({ id: 'id99', displayName: 'Dave', role: 'admin', draftOrderWeight: 5 })
  })
})
