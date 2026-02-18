import firebase from "firebase/app"
import "firebase/analytics"
import "firebase/auth"
import "firebase/firestore"
import "firebase/database"

import { User } from '../../types'

const firebaseLogin = async (): Promise<User | 'logged out'> => {
  const provider = new firebase.auth.GoogleAuthProvider()
  let userResponse: User | 'logged out' = 'logged out'

  await firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
      const credential = result.credential as firebase.auth.OAuthCredential
      // credential.accessToken available if needed for Google API calls
      void credential

      const user = result.user
      if (user) {
        userResponse = {
          uid: user.uid,
          displayName: user.displayName ?? '',
          email: user.email ?? '',
          photoURL: user.photoURL ?? '',
        }
      }
    })
    .catch(() => {
      userResponse = 'logged out'
    })

  return userResponse
}

export default firebaseLogin
