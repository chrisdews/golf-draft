import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import countryIsoConverter from "../../helpers/countryIsoCoverter";

function LiveLeaderboard({ liveLeaderboard, selectedPlayers }) {
  const columns = [
    {
      title: "Position",
      dataIndex: "position",
      width: 20,
    },
    {
      title: "Player",
      dataIndex: "player",
      width: 50,
    },
    {
      title: "Country",
      dataIndex: "imageURL",
      width: 20,
      render: (theImageURL) => <img alt={theImageURL} src={theImageURL} />,
    },
    {
      title: "To Par",
      dataIndex: "totalToPar",
      width: 20,
    },
    {
      title: "Holes Played",
      dataIndex: "holesPlayed",
      width: 20,
    },
    {
      title: "Owner",
      dataIndex: "owner",
      width: 20,
    },
  ];

  let data = [];

  for (let i = 0; i < liveLeaderboard.length; i++) {
    let playerId = liveLeaderboard[i].player_id
    let selected = selectedPlayers && selectedPlayers.find(selected => selected.player_id === playerId)
    let owner
    if (selected) {
         owner = selected.username
    }

    
    data.push({
      key: i,
      position: liveLeaderboard[i].position,
      player: `${liveLeaderboard[i].first_name} ${liveLeaderboard[i].last_name}`,
      imageURL: `https://www.countryflags.io/${countryIsoConverter(
        liveLeaderboard[i].country
      )}/shiny/24.png`,
      totalToPar: liveLeaderboard[i].total_to_par,
      holesPlayed: liveLeaderboard[i].holes_played,
      owner: owner,
    });
  }

  return (
    <>
      <h3>Available Players</h3>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 50 }}
        scroll={{ y: 540 }}
        size="small"
      />
    </>
  );
}

LiveLeaderboard.propTypes = {};

export default LiveLeaderboard;
