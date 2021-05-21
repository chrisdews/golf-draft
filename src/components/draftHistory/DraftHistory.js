import React from "react";
import { Table } from "antd";
import "antd/dist/antd.css";
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
    for (let i = selectedPlayers.length - 1; i > 0; i--) {
      data.push({
        key: i,
        pick: selectedPlayers[i].pick,
        player: `${selectedPlayers[i].player.first_name} ${selectedPlayers[i].player.last_name}`,
        username: selectedPlayers[i].username,
        imageURL: `https://www.countryflags.io/${countryIsoConverter(
          selectedPlayers[i].player.country
        )}/shiny/24.png`,
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
      />
    </div>
  );
}

export default draftHistory;
