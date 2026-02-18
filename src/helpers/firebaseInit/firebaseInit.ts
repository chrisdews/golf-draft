import firebase from "firebase/app"
import "firebase/analytics"
import "firebase/auth"
import "firebase/firestore"
import "firebase/database"

const firebaseInit = (): firebase.database.Database => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    databaseURL: "https://golf-draft-1e6c3-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET!,
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
  } else {
    firebase.app()
  }

  return firebase.database()
}

export default firebaseInit
