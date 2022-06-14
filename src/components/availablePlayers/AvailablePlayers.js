import React from "react";
import PropTypes from "prop-types";

import { Table, Button } from "antd";
import "antd/dist/antd.css";
import countryIsoConverter from "../../helpers/countryIsoCoverter";
import draftHistory from "../draftHistory";

function AvailablePlayers({
  availablePlayerList,
  playerSelectionClick,
  currentPick,
  userData,
  currentTurnData,
  isLoggedIn,
  draftFinished,
}) {
  if (!isLoggedIn) return null;

  if (availablePlayerList === null) return null;

  if (draftFinished) return null;

  const clickHandler = (record, e) => {
    e.preventDefault();

    console.log({ record });
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
          src={`/img/country-flags-main/svg/${flagImage.toLowerCase()}.svg`}
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
      render: (text, record) =>
        record.selectedBy ? (
          record.selectedBy
        ) : (
          <Button
            disabled={disablePicks() || draftFinished}
            onClick={(e) => {
              clickHandler(record, e);
            }}
          >
            select
          </Button>
        ),
    },
  ];

  const data = [];

  for (let i = 0; i < availablePlayerList.length; i++) {
    let worldRanking = "TBC";
    let firstName = availablePlayerList[i]?.first_name;
    let lastName = availablePlayerList[i]?.last_name;
    let flagImage = availablePlayerList[i]?.country
      ? countryIsoConverter(availablePlayerList[i]?.country)
      : "";

    let selectedBy = availablePlayerList[i]?.selectedBy?.username;

    data.push({
      key: i,
      wr: worldRanking,
      flagImage: flagImage,
      player: `${firstName} ${lastName}`,
      selectedBy: selectedBy,
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
