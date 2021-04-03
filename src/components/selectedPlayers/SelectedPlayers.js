import React from "react";
import PropTypes from "prop-types";
import './SelectedPlayers.css'

const SelectedPlayers = ({ selectedPlayers, draftBoi, whosTurn }) => {

    const turnIndicator = () => {
        console.log(whosTurn, draftBoi)
        if (whosTurn === draftBoi){
            return 'myTurn'
        } else {
            return 'notMyTurn'
        }
    }

  return (
    <>
      <div className="selected-list">
      <h1 className={turnIndicator()}>{draftBoi}'s Players</h1>
        {selectedPlayers.map((player, index) => (
          <button key={index}>
            <div>{`${index+1}. ${player.first_name} ${player.last_name}`}</div>
          </button>
        ))}
      </div>
    </>
  );
};

SelectedPlayers.propTypes = {};

export default SelectedPlayers;
