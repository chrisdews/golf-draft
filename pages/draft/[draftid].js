import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import firebaseInit from "../../src/helpers/firebaseInit";
import firebase from "firebase/app";

import { Row, Col, Button, Progress, Alert } from "antd";
import { CheckSquareOutlined, LoadingOutlined } from "@ant-design/icons";

import { Context } from "../../context/provider";

import DraftHistory from "../../src/components/draftHistory";
import AvailablePlayers from "../../src/components/availablePlayers";
import TournamentInfo from "../../src/components/tournamentInfo";
import LiveLeaderboard from "../../src/components/liveLeaderboard";
import UsersList from "../../src/components/usersList";
import sortUsers from "../../src/helpers/sortUsers";

import apiMock from "../../src/hardcodedContent/players";
import leaderboardMock from "../../src/hardcodedContent/leaderboard";
import { useMemo } from "react/cjs/react.production.min";

const useHardCodedContent = process.env.NEXT_PUBLIC_MOCK_ENV === "mock";


const Drafts = () => {
  const database = firebaseInit();
  const router = useRouter();
  const { draftid } = router.query;

  const { state, dispatch } = useContext(Context);
  const draftId = draftid;

  const [isLoading, setIsLoading] = useState(true);

  // used once on draft creation (must be in fusion object format)
  const [playerEntryList, setPlayerEntryList] = useState({});

  // updated with each pick
  const [availablePlayerList, setAvailablePlayerList] = useState({});

  const [tournamentInfo, setTournamentInfo] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [currentPick, setCurrentPick] = useState(0);

  const [whosTurn, setWhosTurn] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [draftStarted, setDraftStarted] = useState(false);
  const [users, setUsers] = useState({});
  const [draftInfo, setDraftInfo] = useState({});
  const [draftFinished, setDraftFinished] = useState(false);
  const [copyClicked, setCopyClicked] = useState(false);
  const [randomiseLoading, setRandomiseLoading] = useState(false);

  const { isLoggedIn, userData } = state;

  useEffect(() => {
    if (draftid) {
      const draftRef = database.ref("drafts/" + draftid);

      draftRef.on("value", (snapshot) => {
        const data = snapshot.val();
        setDraftInfo(data);
      });
    }
  }, [draftid]);

  useEffect(() => {
    if (draftid) {
      const draftRef = database.ref("drafts/" + draftid + "/picks");

      draftRef.on("value", (snapshot) => {
        const data = snapshot.val();
        setSelectedPlayers(data);
      });
    }
  }, []);

  useEffect(() => {
    const currentPickRef = database.ref("drafts/" + draftid + "/currentPick");

    currentPickRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setCurrentPick(data);
    });
  }, []);

  useEffect(() => {
    const availablePlayersRef = database.ref(
      "drafts/" + draftid + "/availablePlayers"
    );

    availablePlayersRef.on("value", (snapshot) => {
      const data = snapshot.val();

      setAvailablePlayerList(data);
    });
  }, [whosTurn]);

  useEffect(() => {
    if (useHardCodedContent) {
      setTournamentInfo(apiMock.results.tournament);
      setPlayerEntryList(Object.assign({}, apiMock.results.entry_list));
      let leaderboard = leaderboardMock.leaderboard;
      setLiveLeaderboard(leaderboard);
      setIsLoading(false);
    } else {
      getTournamentPlayerData();
      getTournamentLiveLeaderboard();
    }
  }, []);

  useEffect(() => {
    getSelectedPlayers();
  }, [currentPick]);

  useEffect(() => {
    const draftRef = database.ref("drafts/" + draftId);

    draftRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data?.draftFinished) {
        setDraftFinished(true);
      }
    });
  }, [currentPick]);

  const getSelectedPlayers = () => {
    const selectedPlayersRef = database.ref("drafts/" + draftId + "/picks");
    selectedPlayersRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setSelectedPlayers(data);
      if (data) {
        setDraftStarted(true);
        setWhosTurn(data[currentPick - 1]);
      }
    });
  };

  const getTournamentPlayerData = async () => {
    console.log("get tournament api called ====");
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/entry-list/${draftInfo?.tournamentId}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY,
          "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setTournamentInfo(res.results.tournament);
        // NEED TO SET AND GET AVAILABLE PLAYERS FROM THE FIREBASE SERVER.
        // it should be object not array.
        setPlayerEntryList(Object.assign({}, res.results.entry_list));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getTournamentLiveLeaderboard = async () => {
    console.log("get leaderboard api called ====");

    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/leaderboard/${draftInfo?.tournamentId}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY,
          "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setLiveLeaderboard(res.results.leaderboard);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const resetDraft = async () => {
    if (window.confirm("Are you sure you wish to delete this item?")) {
      database.ref("drafts/" + draftId + "/picks").remove();
      database
        .ref("drafts/" + draftId + "/availablePlayers")
        .set(playerEntryList);
      database
        .ref("drafts/" + draftId)
        .child("currentPick")
        .set(0);
      database
        .ref("drafts/" + draftId)
        .child("draftFinished")
        .set(false);

      setDraftStarted(false);
      setDraftFinished(false);
    }
  };

  const getCurrentTurnUser = (index) => {
    let round = 1;
    let pick = 1;
    let overall = index + 1;
    let team_pick = 1;
    let userCount = users.length;

    round = Math.floor((overall - 1) / userCount + 1);
    pick = ((overall - 1) % userCount) + 1;
    team_pick = round % 2 ? pick : round * userCount - overall + 1;

    return users[team_pick - 1];
  };

  const createInitialDraftArray = (roundsNum) => {
    let picksNum = roundsNum * users.length;
    return Array.from({ length: picksNum }).map((_, index) => {
      const pickId = index + 1;
      const { id, displayName } = getCurrentTurnUser(index)
      return {
        id,
        pick: pickId,
        userId: id,
        username: displayName,
      };
    });
  };

  const numberOfRoundsCalc = () => {
    const userCount = users.length;
    if (userCount < 2.5) return 12;
    if (userCount < 3.5) return 10;
    if (userCount < 6.5) return 8;
    if (userCount < 10.5) return 6;
    return 4;
  };

  const startDraft = () => {
    database
      .ref("drafts/" + draftId + "/picks")
      .update(createInitialDraftArray(numberOfRoundsCalc()));

    setInitialDraftPlayerData();

    incrementCurrentPick();
    setDraftStarted(true);
  };

  const setInitialDraftPlayerData = () => {
    const availablePlayersRef = database.ref(
      "drafts/" + draftId + "/availablePlayers"
    );

    availablePlayersRef.update(playerEntryList);
  };

  const incrementCurrentPick = () => {
    database
      .ref("drafts/" + draftId)
      .child("currentPick")
      .set(firebase.database.ServerValue.increment(1));
  };

  const writePickData = (draftId, player) => {
    const selectedPlayersRef = database.ref("drafts/" + draftId + "/picks");

    //ADD A SERVER SIDE CHECK THAT THE USER IS CORRECT AND THE PICK HASN'T BEEN MADE ALREADY

    const updatePick = selectedPlayersRef.child(currentPick - 1);
    updatePick.update({
      player_country: player?.country,
      player_first_name: player?.first_name,
      player_last_name: player?.last_name,
      player_id: player?.player_id,
    });
  };

  const updateAvailablePlayersList = (draftId, player, id, whosTurn) => {
    const selectedPlayersRef = database.ref(
      "drafts/" + draftId + "/availablePlayers"
    );

    const selectedPlayerRef = selectedPlayersRef.child(id);

    selectedPlayerRef.update({ selectedBy: whosTurn });
  };

  const updateServerDraftFinished = (draftId) => {
    database
      .ref("drafts/" + draftId)
      .child("draftFinished")
      .set(true);
  };

  const playerSelectionClick = (id) => {
    if (!whosTurn) return;
    let player = { ...availablePlayerList[id] };
    writePickData(draftId, player);

    updateAvailablePlayersList(draftId, player, id, whosTurn);

    // setPlayerEntryList(
    //   // NEED TO SET AND GET AVAILABLE PLAYERS FROM THE SERVER
    //   playerEntryList.filter((p) => p.player_id !== player.player_id)
    // );

    // setPickNo(pickNo + 1);
    // do this on server

    if (currentPick < selectedPlayers.length) {
      incrementCurrentPick();
    } else {
      updateServerDraftFinished(draftId);
      setDraftFinished(true);
      incrementCurrentPick();
      //this needs to be set on the db
    }
  };

  const getUsers = () => {
    const userListRef = database.ref("drafts/" + draftId + "/users");
    userListRef.on("value", (snapshot) => {
      const users = snapshot.val();
      const sortedusers = sortUsers(users)
      setUsers(sortedusers);
    });
  };

  useEffect(() => {
    getUsers();
  }, []);

  const adminDraftSettingsCheck = () => {
    const loggedInDraftUser = users.find((user) => user.id === userData.uid)

    if (
      users &&
      userData &&
      userData.uid &&
      loggedInDraftUser?.role !== "admin"
    )
      return true;

    if (
      draftStarted ||
      !isLoggedIn ||
      (users && users?.length < 1)
    )
      return true;

    return false;
  };

  const draftProgress = (selectedPlayers, currentPick, draftFinished) => {
    if (isLoading) return <LoadingOutlined />;
    if (!currentPick) return null;

    if (selectedPlayers)
      return (
        <>
          <Progress
            percent={(currentPick / selectedPlayers.length) * 100}
            format={() => `${currentPick - 1} / ${selectedPlayers.length}`}
            status={draftFinished ? "" : "active"}
          />
          {draftFinished ? (
            <h3>DRAFT COMPLETE, GOOD LUCK!</h3>
          ) : (
            <h5>Draft Progress</h5>
          )}
        </>
      );
  };

  const loggedOutNotice = () => {
    return (
      !isLoggedIn && (
        <Alert
          message="Logged Out!"
          description="You must be logged in to participate."
          type="error"
          closable
        />
      )
    );
  };

  const draftHeader = () => {
    return <h1>{draftInfo?.draftName}</h1>;
  };

  const tournamentHeader = () => {
    if (isLoading) return <LoadingOutlined />;

    return (
      liveLeaderboard[0] && (
        <TournamentInfo
          tournamentInfo={tournamentInfo}
          leader={liveLeaderboard}
        />
      )
    );
  };

  const whosTurnDisplay = () => {
    if (isLoading) return <LoadingOutlined />;

    if (!whosTurn) return null;

    const { username } = whosTurn;

    return (
      selectedPlayers && (
        <>
          <span>
            Picking Now: <h3>{username}</h3>
          </span>
        </>
      )
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftId).then(
      function () {
        setCopyClicked(true);
      },
      function (err) {
        setCopyClicked(false);
      }
    );
  };

  function iterateWithDelay(users, delay, callback) {
    const draftRef = database.ref("drafts/" + draftid);
    let i = 0;
    const intervalId = setInterval(() => {
      const userRef = draftRef.child("users").child(users[i].id);
      userRef.update({ draftOrderWeight: Math.random() });

      i++;
      if (i === users.length) {
        clearInterval(intervalId);
        callback('finished');
      }
    }, delay);
  }

  const randomiseDraftOrder = () => {
    setRandomiseLoading(true);
    iterateWithDelay(users, 1000, () => {
      setRandomiseLoading(false);
    });
  }



  // users.map((user) => {
  //   setTimeout(() => {
  //     const draftRef = database.ref("drafts/" + draftid);
  //     const userRef = draftRef.child("users").child(user.id);
  //   }, 100)
  // }
  // )

  return (
    <>
      {loggedOutNotice()}
      {draftHeader()}
      {tournamentHeader()}
      {whosTurnDisplay(whosTurn)}
      {draftProgress(selectedPlayers, currentPick, draftFinished)}

      {!isLoading && (
        <>
          <p>
            Draft ID: {draftid}{" "}
            <Button onClick={copyToClipboard}>
              Copy SHARE ID to Clipboard
            </Button>
            {copyClicked && (
              <CheckSquareOutlined
                style={{ color: "green", marginLeft: "10px" }}
              />
            )}
          </p>

          <Button
            disabled={adminDraftSettingsCheck()}
            onClick={() => {
              startDraft();
            }}
          >
            Start Draft
          </Button>
          <Button
            onClick={() => {
              setShowLeaderboard(!showLeaderboard);
            }}
          >
            {showLeaderboard ? "Show Draft" : "Show Leaderboard"}
          </Button>
          <Button
            disabled={adminDraftSettingsCheck()}
            loading={randomiseLoading}
            onClick={() => {
              randomiseDraftOrder()
            }}
          >
            Randomise Order
          </Button>
          {!draftStarted && <p>Only the draft admin can start the draft</p>}

          <UsersList users={users} />

          {!showLeaderboard && (
            <>
              <Row gutter={16}>
                <AvailablePlayers
                  availablePlayerList={availablePlayerList}
                  playerSelectionClick={playerSelectionClick}
                  currentPick={currentPick}
                  userData={userData}
                  currentTurnData={whosTurn}
                  isLoggedIn={isLoggedIn}
                  draftFinished={draftFinished}
                />
              </Row>
              <Row>
                {currentPick > 0 && (
                  <DraftHistory selectedPlayers={selectedPlayers} />
                )}
              </Row>
            </>
          )}

          {showLeaderboard && selectedPlayers && isLoggedIn && (
            <Row gutter={16}>
              <LiveLeaderboard
                liveLeaderboard={liveLeaderboard}
                selectedPlayers={selectedPlayers}
              />
            </Row>
          )}
        </>
      )}
    </>
  );
};

export default Drafts;
