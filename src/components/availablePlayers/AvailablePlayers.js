import React from "react";
import PropTypes from "prop-types";

import { Table, Button } from "antd";
import "antd/dist/antd.css";
import countryIsoConverter from "../../helpers/countryIsoCoverter";

function AvailablePlayers({
  availablePlayers,
  playerSelectionClick,
  currentPick,
  userData,
  currentTurnData,
  isLoggedIn,
}) {
  if (!isLoggedIn) return null;

  const clickHandler = (record) => {
    if (window.confirm(`Are you sure you wish to draft ${record.player}?`)) {
      playerSelectionClick(record.key);
    }
  };

  const disablePicks = () => {
    if (
      currentPick !== 0 &&
      currentTurnData &&
      userData?.uid === currentTurnData.userId
    )
      return false;
    return true;
  };

  const columns = [
    {
      title: "WR",
      dataIndex: "wr",
      width: 15,
    },
    {
      title: "",
      dataIndex: "flagImage",
      width: 10,
      render: (flagImage) => (
        <img
          alt={flagImage}
          src={`/img/country-flags-main/svg/${flagImage}.svg`}
        />
      ),
    },
    {
      title: "Player",
      dataIndex: "player",
      width: 35,
      render: (text) => <a>{text}</a>,
    },
    {
      title: "",
      dataIndex: "Button",
      width: 25,
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
      ? countryIsoConverter(availablePlayers[i].country)
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
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ y: 540 }}
        size="small"
      />
    </div>
  );
}

AvailablePlayers.propTypes = {};

export default AvailablePlayers;
