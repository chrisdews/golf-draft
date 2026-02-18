import { DraftUser } from '../types'

type FirebaseUsersSnapshot = Record<string, Omit<DraftUser, 'id'>>

export default function sortUsers(users: FirebaseUsersSnapshot): DraftUser[] {
  const userListArr: DraftUser[] = []
  for (const key in users) {
    if (Object.hasOwnProperty.call(users, key)) {
      userListArr.push({ ...users[key], id: key })
    }
  }
  return userListArr.sort((a, b) => a.draftOrderWeight - b.draftOrderWeight)
}
