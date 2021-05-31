import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import firebaseInit from "../../src/helpers/firebaseInit";
import DraftHistory from "../../src/components/draftHistory";
import HomeLayout from "../../src/components/homeLayout";

const Drafts = () => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const database = firebaseInit();
  const router = useRouter();
  const { draftid } = router.query;
  const draftRef = database.ref("drafts/" + draftid);

  useEffect(() => {
    if (draftid) {
      draftRef.on("value", (snapshot) => {
        const data = snapshot.val();
        setSelectedPlayers(data);
      });
    }
  }, [draftid]);

  return (
    <>
      <HomeLayout>
        <DraftHistory selectedPlayers={selectedPlayers}></DraftHistory>
        <p>draft: {draftid}</p>;
      </HomeLayout>
    </>
  );
};

export default Drafts;
