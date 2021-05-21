import React from "react";
import PropTypes from "prop-types";
import "./SelectedPlayers.css";
import countryIsoConverter from '../../helpers/countryIsoCoverter'

const SelectedPlayers = ({ selectedPlayers, draftBoi, whosTurn, liveLeaderboard }) => {

  const turnIndicator = () => {
    if (whosTurn === draftBoi) {
      return "myTurn";
    } else {
      return "notMyTurn";
    }
  };

  const pickSorter = () => {
    let sortedPlayers = [];
    for (const pick in selectedPlayers){
      if (selectedPlayers[pick].username === draftBoi){
        sortedPlayers.push(selectedPlayers[pick])
      }
    }
    return sortedPlayers
  };

  const liveScoreMatcher = (playerId) => {
    let score = liveLeaderboard.filter((position) => position.player_id === playerId)[0].total_to_par
    let colour = score < 1 ? 'green' : "red"
    return [<span className={colour}>{score}</span>]
  }

  return (
    <>
      <div className="selected-list">
        <h1 className={turnIndicator()}>{draftBoi}'s Players</h1>
        <ol>
        {pickSorter().map((pick, index) => (
            <li key={index}>
            <img src={`https://www.countryflags.io/${countryIsoConverter(pick.player.country)}/shiny/24.png`}></img>
            {`  ${pick.player.first_name} ${pick.player.last_name}  `}
            <span>{liveScoreMatcher(pick.player.player_id)}</span>
            <span></span>
            </li>
        ))}
        </ol>
      </div>
    </>
  );
};

SelectedPlayers.propTypes = {};

export default SelectedPlayers;
