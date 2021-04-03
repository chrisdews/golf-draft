import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import AvailablePlayers from "../availablePlayers";
import Header from "../header";
import SelectedPlayers from "../selectedPlayers";

import apiMock from "../../hardcodedContent/players";

const GolfDraft = () => {
  useEffect(() => {
    // getTournamentData();
    setAvailablePlayers(apiMock.results.entry_list);
    setTournamentInfo(apiMock.results.tournament)
    setIsLoading(false);
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [tournamentInfo, setTournamentInfo] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

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

  const playerSelectionClick = (id) => {
    console.log(id);
    let player = { ...availablePlayers[id] };

    setSelectedPlayers([...selectedPlayers, player]);
    setAvailablePlayers(
      availablePlayers.filter((p) => p.player_id !== player.player_id)
    );
  };

  return (
    <div>
      {!isLoading && (
        <>
          <Header tournamentInfo={tournamentInfo} />
          {availablePlayers && <AvailablePlayers
            isLoading={isLoading}
            availablePlayers={availablePlayers}
            playerSelectionClick={playerSelectionClick}
          /> }
          <SelectedPlayers selectedPlayers={selectedPlayers} />
        </>
      )}
    </div>
  );
};

GolfDraft.propTypes = {};

export default GolfDraft;
