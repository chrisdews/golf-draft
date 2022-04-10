import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import firebaseInit from "../../src/helpers/firebaseInit";
import firebase from "firebase/app";

import { Row, Col, Button, Progress } from "antd";

import { Context } from "../../context/provider";

import DraftHistory from "../../src/components/draftHistory";
import AvailablePlayers from "../../src/components/availablePlayers";
import Header from "../../src/components/header";
import LiveLeaderboard from "../../src/components/liveLeaderboard";
import UsersList from "../../src/components/usersList";

import apiMock from "../../src/hardcodedContent/players";
import leaderboardMock from "../../src/hardcodedContent/leaderboard";

const useHardCodedContent = process.env.NEXT_PUBLIC_MOCK_ENV === "mock";

const draftBois = ["Xander", "Dewsy"];

const Drafts = () => {
  const database = firebaseInit();
  const router = useRouter();
  const { draftid } = router.query;

  const { state, dispatch } = useContext(Context);
  const draftId = draftid;

  const [isLoading, setIsLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [tournamentInfo, setTournamentInfo] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [currentPick, setCurrentPick] = useState(0);

  const [whosTurn, setWhosTurn] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [draftStarted, setDraftStarted] = useState(false);
  const [users, setUsers] = useState({});

  const { isLoggedIn } = state;

  useEffect(() => {
    if (draftid) {
      const draftRef = database.ref("drafts/" + draftid);

      draftRef.on("value", (snapshot) => {
        const data = snapshot.val();
        setSelectedPlayers(data);
      });
    }
  }, [draftid]);

  useEffect(() => {
    const currentPickRef = database.ref("drafts/" + draftid + "/currentPick");

    currentPickRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setCurrentPick(data);
    });
  }, []);

  useEffect(() => {
    if (useHardCodedContent) {
      setTournamentInfo(apiMock.results.tournament);
      setAvailablePlayers(apiMock.results.entry_list);
      let leaderboard = leaderboardMock.leaderboard;
      setLiveLeaderboard(leaderboard);
      setIsLoading(false);
    } else {
      getTournamentPlayerData();
      getTournamentLiveLeaderboard();
    }
    getSelectedPlayers();
  }, []);

  const getSelectedPlayers = () => {
    const selectedPlayersRef = database.ref("drafts/" + draftId + "/picks");
    selectedPlayersRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setSelectedPlayers(data);
      if (data) {
        setDraftStarted(true);

        setWhosTurn(data[currentPick]?.username);
      }
    });
  };

  const writePickData = (draftId, whosTurn, player) => {
    const selectedPlayersRef = database.ref("drafts/" + draftId + "/picks");

    // selectedPlayersRef.on("child_changed", function(snapshot) {
    //   const changedPick = snapshot.val();
    //   console.log("The updated player title is " + changedPick.player);
    // });
    // we can use this to push updates to clients

    const updatePick = selectedPlayersRef.child(currentPick);
    updatePick.update({
      player_country: player.country,
      player_first_name: player.first_name,
      player_last_name: player.last_name,
      player_id: player.player_id,
    });
  };

  const getTournamentPlayerData = async () => {
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/entry-list/${process.env.NEXT_PUBLIC_TOURNAMENT_ID}`,
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
        setAvailablePlayers(res.results.entry_list);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getTournamentLiveLeaderboard = async () => {
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/leaderboard/${process.env.NEXT_PUBLIC_TOURNAMENT_ID}`,
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
      setDraftStarted(false);
    }
  };

  const getCurrentTurnUser = (index) => {
    let round = 1;
    let pick = 1;
    let overall = index + 1;
    let team_pick = 1;
    let userCount = Object.keys(users).length;

    round = Math.floor((overall - 1) / userCount + 1);
    pick = ((overall - 1) % userCount) + 1;
    team_pick = round % 2 ? pick : round * userCount - overall + 1;

    return Object.keys(users)[team_pick - 1];
  };

  const createInitialDraftArray = (roundsNum) => {
    let picksNum = roundsNum * Object.keys(users).length;
    return Array.from({ length: picksNum }).map((_, index) => {
      const id = index + 1;
      return {
        id,
        pick: id,
        userId: getCurrentTurnUser(index),
        username: users[getCurrentTurnUser(index)]?.displayName,
      };
    });
  };

  const startDraft = () => {
    setWhosTurn(users[0]?.displayName);
    database
      .ref("drafts/" + draftId + "/picks")
      .update(createInitialDraftArray(12));

    incrementCurrentPick()

    setDraftStarted(true);
  };

  const incrementCurrentPick = () => {
    database
      .ref("drafts/" + draftId)
      .child("currentPick")
      .set(firebase.database.ServerValue.increment(1));
  };

  const playerSelectionClick = (id) => {
    if (!whosTurn) return;
    let player = { ...availablePlayers[id] };
    writePickData(draftId, whosTurn, player);

    setAvailablePlayers(
      availablePlayers.filter((p) => p.player_id !== player.player_id)
    );

    // setPickNo(pickNo + 1);
    // do this on server
    incrementCurrentPick();
  };

  const getUserList = () => {
    const userListRef = database.ref("drafts/" + draftId + "/users");
    userListRef.on("value", (snapshot) => {
      const userList = snapshot.val();
      setUsers(userList);
    });
  };

  useEffect(() => {
    getUserList();
  }, []);

  return (
    <>
      {!isLoading && (
        <>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              {liveLeaderboard[0] && (
                <Header
                  tournamentInfo={tournamentInfo}
                  leader={liveLeaderboard}
                />
              )}
            </Col>
            <Col className="gutter-row" span={8}>
              {selectedPlayers && (
                <>
                  <p>Picking Now:</p>
                  <h3>{whosTurn}</h3>
                </>
              )}
              {/* base this on round number / final round */}
            </Col>
            <Col className="gutter-row" span={4}>
              {selectedPlayers && (
                <>
                  <Progress
                    type="circle"
                    percent={(currentPick / selectedPlayers.length) * 100}
                    format={() => `${currentPick} / ${selectedPlayers.length}`}
                  />
                  <h5>Draft Progress</h5>
                </>
              )}
              {/* base this on round number / final round */}
            </Col>
          </Row>
          <Button
            disabled={draftStarted}
            onClick={() => {
              startDraft();
            }}
          >
            'Start Draft'
          </Button>
          <Button
            onClick={() => {
              setShowLeaderboard(!showLeaderboard);
            }}
          >
            {showLeaderboard ? "show Draft" : "show Leaderboard"}
          </Button>

          <UsersList users={users} />

          {!showLeaderboard && (
            <Row gutter={16}>
              <Col className="gutter-row" span={12}>
                <AvailablePlayers
                  availablePlayers={availablePlayers}
                  playerSelectionClick={playerSelectionClick}
                  currentPick={currentPick}
                />
              </Col>
              <Col className="gutter-row" span={12}>
                {currentPick > 0 && <DraftHistory selectedPlayers={selectedPlayers} />}
              </Col>
            </Row>
          )}

          {showLeaderboard && selectedPlayers && isLoggedIn && (
            <Row gutter={16}>
              <Col className="gutter-row" span={18}>
                <LiveLeaderboard
                  liveLeaderboard={liveLeaderboard}
                  selectedPlayers={selectedPlayers}
                />
              </Col>
            </Row>
          )}
        </>
      )}
      <p>draft: {draftid}</p>
      <button onClick={resetDraft}>delete</button>
    </>
  );
};

export default Drafts;
