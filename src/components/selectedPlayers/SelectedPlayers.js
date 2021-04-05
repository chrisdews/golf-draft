import React from "react";
import PropTypes from "prop-types";
import "./SelectedPlayers.css";

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
    for (const property in selectedPlayers) {
      if (selectedPlayers[property].username === draftBoi) {
        sortedPlayers.push(
          `${selectedPlayers[property].first_name} ${selectedPlayers[property].last_name}`
        );
      }
    }
    return sortedPlayers;
  };

  return (
    <>
      <div className="selected-list">
        <h1 className={turnIndicator()}>{draftBoi}'s Players</h1>
        {pickSorter().map((player, index) => (
          <button key={index}>
            <div>{`${index+1}. ${player}`}</div>
        </button>
        ))}
      </div>
    </>
  );
};

SelectedPlayers.propTypes = {};

export default SelectedPlayers;
