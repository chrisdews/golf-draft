import React from "react";
import PropTypes from "prop-types";

function Header({ tournamentInfo, leader }) {
  return (
    <>
      <h1>{tournamentInfo.name}</h1>
      <div>{tournamentInfo.course}</div>
      <div>{tournamentInfo.country}</div>
      <>
        <h3>{`Current Leader: ${leader.last_name} ${leader.total_to_par}`}</h3>
        <p>{`last updated: ${leader.updated}`}</p>
      </>
    </>
  );
}

Header.propTypes = {};

export default Header;
