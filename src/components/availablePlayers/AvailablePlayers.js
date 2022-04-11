import React from "react";
import PropTypes from "prop-types";

import { Table, Button } from "antd";
import "antd/dist/antd.css";
import countryIsoConverter from "../../helpers/countryIsoCoverter";

function AvailablePlayers({ availablePlayers, playerSelectionClick, currentPick, userData, currentTurnData, isLoggedIn }) {

  if (!isLoggedIn) return null

  const clickHandler = (record) => {
    if (window.confirm(`Are you sure you wish to draft ${record.player}?`)) {
      playerSelectionClick(record.key);
    }
  };

  const disablePicks = () => {
    if (currentPick !== 0 && currentTurnData && userData?.uid === currentTurnData.userId) return false
    return true
  }

  const columns = [
    {
      title: "WR",
      dataIndex: "wr",
      width: 20,
    },
    {
      title: "",
      dataIndex: "flagImage",
      width: 20,
      render: (theImageURL) => <img alt={theImageURL} src={theImageURL} />,
    },
    {
      title: "Player",
      dataIndex: "player",
      width: 50,
      render: (text) => (
        <a
          onRow={(record) => ({
            onClick: () => {
              clickHandler(record.key);
            },
          })}
        >
          {text}
        </a>
      ),
    },
    {
      title: "",
      dataIndex: "Button",
      width: 20,
      render: () => (
        <Button
          disabled={disablePicks()}
          onRow={(record) => ({
            onClick: () => {
              clickHandler(record.key);
            },
          })}
        >
          select
        </Button>
      ),
    },
  ];

  const data = [];
  for (let i = 0; i < availablePlayers.length; i++) {
    let worldRanking = "TBC";
    let firstName = availablePlayers[i].first_name;
    let lastName = availablePlayers[i].last_name;
    let flagImage = availablePlayers[i].country
      ? countryIsoConverter(
          availablePlayers[i].country
        )
      : "";

    data.push({
      key: i,
      wr: worldRanking,
      flagImage: flagImage,
      player: `${firstName} ${lastName}`,
    });
  }

  const style = { padding: "8px" };

  return (
    <div style={style}>
      <h3>Available Players</h3>
      <Table
        onRow={(record) => ({
          onClick: () => {
            clickHandler(record);
          },
        })}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 50 }}
        scroll={{ y: 540 }}
        size="small"
      />
    </div>
  );
}

AvailablePlayers.propTypes = {};

export default AvailablePlayers;
