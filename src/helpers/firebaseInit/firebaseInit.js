import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";


const firebaseInit = () => {
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
        storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      };
    
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      } else {
        firebase.app();
      }
      
      return firebase.database();
}

export default firebaseInit