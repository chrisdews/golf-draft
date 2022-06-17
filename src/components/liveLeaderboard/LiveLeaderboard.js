import React from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import countryIsoConverter from "../../helpers/countryIsoCoverter";

function LiveLeaderboard({ liveLeaderboard, selectedPlayers }) {
  const columns = [
    // {
    //   title: "",
    //   dataIndex: "position",
    //   width: 10,
    // },
    {
      title: "Player",
      dataIndex: "player",
      width: 30,
    },
    {
      title: "",
      dataIndex: "countryIso",
      width: 10,
      render: (flagImage) => (
        <img
          alt={flagImage}
          src={`/img/country-flags-main/svg/${flagImage?.toLowerCase()}.svg`}
        />
      ),
    },
    {
      title: "To Par",
      dataIndex: "totalToPar",
      width: 15,
    },
    {
      title: "Hole",
      dataIndex: "holesPlayed",
      width: 15,
    },
    {
      title: "Owner",
      dataIndex: "owner",
      width: 30,
    },
  ];

  let data = [];

  for (let i = 0; i < liveLeaderboard.length; i++) {
    let playerId = liveLeaderboard[i].player_id;
    let firstName = liveLeaderboard[i].first_name;
    let lastName = liveLeaderboard[i].last_name;
    let position = liveLeaderboard[i].position;
    let countryIso = liveLeaderboard[i]?.country
      ? countryIsoConverter(liveLeaderboard[i]?.country)
      : "";
    let totalToPar = liveLeaderboard[i]?.total_to_par;
    let holes_played = liveLeaderboard[i]?.holes_played;
    let selected =
      selectedPlayers &&
      selectedPlayers.find((selected) => selected.player_id === playerId);
    let owner;
    if (selected) {
      owner = selected.username;
    }

    // if (lastName) {
      data.push({
        key: i,
        position: position,
        player: `${firstName} ${lastName}`,
        countryIso: countryIso,
        totalToPar: totalToPar,
        holesPlayed: holes_played,
        owner: owner,
      });
    // }
  }

  return (
    <>
      <h3>Live Leaderboard</h3>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ y: 540 }}
        size="small"
      />
    </>
  );
}

LiveLeaderboard.propTypes = {};

export default LiveLeaderboard;
