import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";

import AvailablePlayers from "../availablePlayers";
import Header from "../header";
import SelectedPlayers from "../selectedPlayers";
import "./GolfDraft.css";
import apiMock from "../../hardcodedContent/players";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DB_URL,
  // projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  // messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  // appId: process.env.REACT_APP_APP_ID,
  // measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

const database = firebase.database();
const draftBoiz = ["Dewsy", "Xander"];
const draftId = 1000001;

function GolfDraft() {
  const [isLoading, setIsLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [tournamentInfo, setTournamentInfo] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState({});

  const [pickNo, setPickNo] = useState(0);
  const [pickBoi, setPickBoi] = useState(0);
  const [whosTurn, setWhosTurn] = useState(null);
  const [first, setFirst] = useState(true);
  const [reverseOrder, setReverseOrder] = useState(false);
  const [draftBois, setDraftBois] = useState(draftBoiz);

  useEffect(() => {
    // getTournamentData();
    setAvailablePlayers(apiMock.results.entry_list);
    setTournamentInfo(apiMock.results.tournament);
    getSelectedPlayers();
    setIsLoading(false);
  }, []);
  
  useEffect(() => {

    if (pickNo === 0) return;
    if (pickNo % draftBois.length === 0) {
      setReverseOrder(!reverseOrder);
    } else {
      nextPickBoi();
    }
  }, [pickNo]);

  useEffect(() => {
    if (pickBoi === 0 && first) {
      setFirst(false);
      return;
    }
    setWhosTurn(draftBois[pickBoi]);
  }, [pickBoi]);

  const getSelectedPlayers = async () => {
    const selectedPlayersRef = database.ref("drafts/" + draftId);
    selectedPlayersRef.on("value", (snapshot) => {
      const data = snapshot.val();
      setSelectedPlayers(data);
    });
  };

  const writePickData = (draftId, pickNoAdjusted, whosTurn, player) => {
    let obj = {};
    obj[pickNoAdjusted] = {
      pick: pickNoAdjusted,
      username: whosTurn,
      player: player,
    };
    database.ref("drafts/" + draftId).update(obj);
  };

  const getTournamentData = () => {
    fetch("https://golf-leaderboard-data.p.rapidapi.com/entry-list/279", {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.REACT_APP_API_KEY,
        "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setTournamentInfo(result.results.tournament);
        setAvailablePlayers(result.results.entry_list);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const coinToss = () => {
    const newDraftBois = draftBoiz.sort(() => Math.random() - 0.5);
    setDraftBois(newDraftBois);
    setWhosTurn(newDraftBois[0]);
  };

  const playerSelectionClick = (id) => {
    if (!whosTurn) return;
    let player = { ...availablePlayers[id] };
    writePickData(draftId, pickNo + 1, whosTurn, player);

    setAvailablePlayers(
      availablePlayers.filter((p) => p.player_id !== player.player_id)
    );
    // if the pick number is even, pick again, if it's odd change whosTurn
    setPickNo(pickNo + 1);
  };

  const nextPickBoi = () => {
    if (reverseOrder) {
      setPickBoi(pickBoi - 1);
    } else {
      setPickBoi(pickBoi + 1);
    }
  };

  return (
    <div>
      {!isLoading && (
        <>
          <Header tournamentInfo={tournamentInfo} />
          <button
            onClick={() => {
              coinToss();
            }}
          >
            COIN TOSS
          </button>
          <div className="selected-players-container">
            <div>Pick Number: {pickNo + 1}</div>
            <div className="selected-container">
              {draftBois.map((draftBoi) => (
                <SelectedPlayers
                  key={draftBoi}
                  selectedPlayers={selectedPlayers}
                  draftBoi={draftBoi}
                  whosTurn={whosTurn}
                />
              ))}
            </div>
          </div>
          {availablePlayers && (
            <AvailablePlayers
              isLoading={isLoading}
              availablePlayers={availablePlayers}
              playerSelectionClick={playerSelectionClick}
            />
          )}
        </>
      )}
    </div>
  );
}

GolfDraft.propTypes = {};

export default GolfDraft;
