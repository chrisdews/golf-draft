import React from "react";
import PropTypes from "prop-types";

const SelectedPlayers = ({ selectedPlayers }) => {
  return (
    <>
      <h1>Dewsy's Players</h1>
      <div>
        {selectedPlayers.map((player, index) => (
          <button key={index}>
            <div>{`${player.first_name} ${player.last_name}`}</div>
            <div>{player.country}</div>
          </button>
        ))}
      </div>
    </>
  );
};

SelectedPlayers.propTypes = {};

export default SelectedPlayers;
