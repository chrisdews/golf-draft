import React from "react";
import { Table } from "antd";
import countryIsoConverter from "../../helpers/countryIsoCoverter";

function draftHistory({ selectedPlayers }) {
  const columns = [
    {
      title: "Pick",
      dataIndex: "pick",
      width: 50,
    },
    {
      title: "User",
      dataIndex: "username",
      width: 50,
    },
    {
      title: "Player",
      dataIndex: "player",
      width: 50,
    },
    {
      title: "",
      dataIndex: "imageURL",
      width: 20,
      render: (theImageURL) => <img alt={theImageURL} src={theImageURL} />,
    },
  ];

  const data = [];

  if (selectedPlayers) {
    for (let i = 0; i < selectedPlayers.length; i++) {
      let username = selectedPlayers[i]?.username;
      let playername = selectedPlayers[i]?.player_last_name
        ? `${selectedPlayers[i].player_first_name} ${selectedPlayers[i]?.player_last_name}`
        : "";
      let imageURL = selectedPlayers[i]?.player_country
        ? countryIsoConverter(
            selectedPlayers[i]?.player_country
          )
        : "";
      let pick = selectedPlayers[i]?.pick;
      data.push({
        key: i,
        pick: pick,
        player: playername,
        username: username,
        imageURL: imageURL,
      });
    }
  }

  const style = { padding: "8px" };

  return (
    <div style={style}>
      <h3>Draft History</h3>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 50 }}
        scroll={{ y: 540 }}
        size="small"
      />
    </div>
  );
}

export default draftHistory;
