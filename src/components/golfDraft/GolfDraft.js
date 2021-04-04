import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import AvailablePlayers from "../availablePlayers";
import Header from "../header";
import SelectedPlayers from "../selectedPlayers";
import './GolfDraft.css'

import apiMock from "../../hardcodedContent/players";
const draftBoiz = ['Dewsy', 'Xander', 'Phil']

const GolfDraft = () => {

  const [isLoading, setIsLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [tournamentInfo, setTournamentInfo] = useState([]);
  const [selectedPlayersA, setSelectedPlayersA] = useState([]);
  const [selectedPlayersB, setSelectedPlayersB] = useState([]);
  const [pickNo, setPickNo] = useState(0)
  const [pickBoi, setPickBoi] = useState(0)
  const [whosTurn, setWhosTurn] = useState()
  const [first, setFirst] = useState(true)
  const [reverseOrder, setReverseOrder] = useState(false)
  const [draftBois, setDraftBois] = useState(draftBoiz)
  

  useEffect(() => {
    // getTournamentData();
    setAvailablePlayers(apiMock.results.entry_list);
    setTournamentInfo(apiMock.results.tournament)
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (pickNo === 0) return
    if (pickNo % draftBois.length === 0) {
      setReverseOrder(!reverseOrder)
    } else {
      nextPickBoi()
    }
  }, [pickNo])

  useEffect(() => {
    if (pickBoi === 0 && first) {
      setFirst(false)
      return
    }
    setWhosTurn(draftBois[pickBoi])
  }, [pickBoi])


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
    const newDraftBois = draftBoiz.sort(() => Math.random() - 0.5)
    setDraftBois(newDraftBois)
    setWhosTurn(newDraftBois[0])
  }

  const playerSelectionClick = (id) => {
    console.log(id);
    let player = { ...availablePlayers[id] };
    if (whosTurn === draftBois[0]) {
        setSelectedPlayersA([...selectedPlayersA, player]);
    } else if (whosTurn === draftBois[1]) {
        setSelectedPlayersB([...selectedPlayersB, player]);
    }
    setAvailablePlayers(
      availablePlayers.filter((p) => p.player_id !== player.player_id)
    );
    // if the pick number is even, pick again, if it's odd change whosTurn
    setPickNo(pickNo +1)
    // if (pickNo % 2 === 1) {
    //     let nextTurnBoi = draftBois.filter(boi => boi != whosTurn)
    //     setWhosTurn(nextTurnBoi[0])
    // }
  };


  const nextPickBoi = () => {
    if (reverseOrder) {
      setPickBoi(pickBoi - 1)
    } else {
      setPickBoi(pickBoi + 1)
    }
  }

  return (
    <div>
      {!isLoading && (
        <>
          <Header tournamentInfo={tournamentInfo} />
          <button onClick={() => {coinToss()}}>COIN TOSS</button>
          <div className="selected-players-container">
          <div>Pick Number: {pickNo + 1}</div>
          <div className="selected-container">
          <SelectedPlayers selectedPlayers={selectedPlayersA} draftBoi={draftBois[0]} whosTurn={whosTurn} />
          <SelectedPlayers selectedPlayers={selectedPlayersB} draftBoi={draftBois[1]} whosTurn={whosTurn}/>
          </div>
          </div>
          {availablePlayers && <AvailablePlayers
            isLoading={isLoading}
            availablePlayers={availablePlayers}
            playerSelectionClick={playerSelectionClick}
          /> }
        </>
      )}
    </div>
  );
};

GolfDraft.propTypes = {};

export default GolfDraft;
