import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import firebase from "firebase/app";
import "firebase/database";
import DraftHistory from "../../src/components/draftHistory";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
};

const Drafts = () => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }
  const router = useRouter();
  const { draftid } = router.query;
  const database = firebase.database();
  const draftRef = database.ref("drafts/" + draftid);

  useEffect(() => {
    if (draftid) {
      draftRef.on("value", (snapshot) => {
        const data = snapshot.val();
        console.log(data);
        setSelectedPlayers(data);
      });
    }
  }, [draftid]);

  return (
    <>
      <DraftHistory selectedPlayers={selectedPlayers}></DraftHistory>
      <p>draft: {draftid}</p>;
    </>
  );
};

export default Drafts;
