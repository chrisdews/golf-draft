import React from "react";
import PropTypes from "prop-types";

function TournamentInfo({ tournamentInfo }) {
 
  return (
    <>
      <h3>{tournamentInfo.name}</h3>
      <h4>{tournamentInfo.course}</h4>
      <h5>{tournamentInfo.country}</h5>
    </>
  );
}

TournamentInfo.propTypes = {};

export default TournamentInfo;
