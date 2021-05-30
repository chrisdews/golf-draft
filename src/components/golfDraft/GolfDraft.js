import React, { useEffect, useState } from "react";
import { Row, Col, Button, Progress } from "antd";
import PropTypes from "prop-types";
import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";

import AvailablePlayers from "../availablePlayers";
import Header from "../header";
import LiveLeaderboard from "../liveLeaderboard";
import DraftHistory from "../draftHistory";
import apiMock from "../../hardcodedContent/players";
import leaderboardMock from "../../hardcodedContent/leaderboard";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
};

const useHardCodedContent = process.env.NEXT_PUBLIC_MOCK_ENV === "mock";
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const provider = new firebase.auth.GoogleAuthProvider();
firebase.auth()
  .signInWithPopup(provider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;

    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    console.log(credential, token, user)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });



const database = firebase.database();
const draftBois = ["Dewsy", "Xander"];
const draftId = useHardCodedContent ? 8000001 : 1000002;

function GolfDraft() {
  const [isLoading, setIsLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [tournamentInfo, setTournamentInfo] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [pickNo, setPickNo] = useState(0);
  const [whosTurn, setWhosTurn] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [draftStarted, setDraftStarted] = useState(false);

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
    const selectedPlayersRef = database.ref("drafts/" + draftId);
    selectedPlayersRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setSelectedPlayers(data);
      if (data) {
        setDraftStarted(true);
        let firstEmptyPickIndex = data.findIndex(
          (el) => el.player_last_name === undefined
        );
        if (firstEmptyPickIndex === -1) {
          setPickNo(data.length);
          setWhosTurn("draft complete");
        } else {
          setPickNo(firstEmptyPickIndex);
          setWhosTurn(data[firstEmptyPickIndex].username);
        }
      }
    });
  };

  const writePickData = (draftId, pickNoAdjusted, whosTurn, player) => {
    const selectedPlayersRef = database.ref("drafts/" + draftId);

    // selectedPlayersRef.on("child_changed", function(snapshot) {
    //   const changedPick = snapshot.val();
    //   console.log("The updated player title is " + changedPick.player);
    // });
    // we can use this to push updates to clients

    const updatePick = selectedPlayersRef.child(pickNoAdjusted);
    updatePick.update({
      player_country: player.country,
      player_first_name: player.first_name,
      player_last_name: player.last_name,
      player_id: player.player_id,
    });
  };

  const getTournamentPlayerData = async () => {
    await fetch("https://golf-leaderboard-data.p.rapidapi.com/entry-list/285", {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY,
        "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
      },
    })
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
    console.log("test2");

    await fetch(
      "https://golf-leaderboard-data.p.rapidapi.com/leaderboard/285",
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
      database.ref("drafts/" + draftId).remove();
      setDraftStarted(false);
    }
  };

  const getUsername = (index) => {
    let round = 1;
    let pick = 1;
    let overall = index + 1;
    let team_pick = 1;
    let total_rounds = 12;
    let total_teams = draftBois.length;

    round = Math.floor((overall - 1) / total_teams + 1);
    pick = ((overall - 1) % total_teams) + 1;
    team_pick = round % 2 ? pick : round * total_teams - overall + 1;
    return draftBois[team_pick - 1];
  };

  const createInitialDraftArray = (roundsNum) => {
    let picksNum = roundsNum * draftBois.length;
    return Array.from({ length: picksNum }).map((_, index) => {
      const id = index + 1;
      return { id, pick: id, player: "", username: getUsername(index) };
    });
  };

  const startDraft = () => {
    setWhosTurn(draftBois[0]);
    database.ref("drafts/" + draftId).update(createInitialDraftArray(6));
    // make the 6 a user selection
    setDraftStarted(true);
  };

  const playerSelectionClick = (id) => {
    if (!whosTurn) return;
    let player = { ...availablePlayers[id] };
    writePickData(draftId, pickNo, whosTurn, player);

    setAvailablePlayers(
      availablePlayers.filter((p) => p.player_id !== player.player_id)
    );
    // if the pick number is even, pick again, if it's odd change whosTurn
    setPickNo(pickNo + 1);
  };

  return (
    <div>
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
                    percent={(pickNo / selectedPlayers.length) * 100}
                    format={() => `${pickNo} / ${selectedPlayers.length}`}
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

          {!showLeaderboard && (
            <Row gutter={16}>
              <Col className="gutter-row" span={12}>
                <AvailablePlayers
                  availablePlayers={availablePlayers}
                  playerSelectionClick={playerSelectionClick}
                />
              </Col>
              <Col className="gutter-row" span={12}>
                <DraftHistory selectedPlayers={selectedPlayers} />
              </Col>
            </Row>
          )}

          {showLeaderboard && (
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

      <button onClick={resetDraft}>delete</button>
    </div>
  );
}

GolfDraft.propTypes = {};

export default GolfDraft;
