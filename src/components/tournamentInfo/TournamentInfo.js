import React from "react";

function TournamentInfo({ nextPgaEvent }) {

  const timeHelper = () => {
    const time = Date.parse(nextPgaEvent.start_date) - Date.now();
    if (time < 0) return null
    const days = Math.ceil(time / (1000 * 60 * 60 * 24));
    if (days < 1) {
      return "starts today!";
    }
    return `starts in ${days} day${days > 1 ? "s" : ""}...`;
  }
 
  return (
    <>
      <h3 style={{fontWeight: "800"}}>{nextPgaEvent.name}</h3>
      <h4>{nextPgaEvent.course}</h4>
      <h5>{nextPgaEvent.country}</h5>
      {timeHelper()}
    </>
  );
}

TournamentInfo.propTypes = {};

export default TournamentInfo;
