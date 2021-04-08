import React from "react";
import PropTypes from "prop-types";
import "./SelectedPlayers.css";
import countryIsoConverter from '../../helpers/countryIsoCoverter'

const SelectedPlayers = ({ selectedPlayers, draftBoi, whosTurn }) => {
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

  return (
    <>
      <div className="selected-list">
        <h1 className={turnIndicator()}>{draftBoi}'s Players</h1>
        <ol>
        {pickSorter().map((pick, index) => (
            <li key={index}>{`${pick.player.first_name} ${pick.player.last_name} `}<img src={`https://www.countryflags.io/${countryIsoConverter(pick.player.country)}/shiny/32.png`}></img></li>
        ))}
        </ol>
      </div>
    </>
  );
};

SelectedPlayers.propTypes = {};

export default SelectedPlayers;
