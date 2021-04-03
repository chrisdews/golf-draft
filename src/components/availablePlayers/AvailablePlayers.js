import React from "react";
import PropTypes from "prop-types";
import './AvailablePlayers.css'

function AvailablePlayers({ availablePlayers, playerSelectionClick }) {
  
  const clickHandler = (index) => {
      playerSelectionClick(index)
  };

  return (
    <div className="available-player-container">
    {console.log(availablePlayers)}
      {availablePlayers.map((player, index) => (
        <button onClick={() => clickHandler(index)} key={index}>
          <div>{`${player.first_name} ${player.last_name}`}</div>
          <div>{player.country}</div>
        </button>
      ))}
    </div>
  );
}

AvailablePlayers.propTypes = {};

export default AvailablePlayers;
