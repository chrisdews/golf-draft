import React from "react";
import PropTypes from "prop-types";

import { Table, Button } from "antd";
import "antd/dist/antd.css";
import countryIsoConverter from "../../helpers/countryIsoCoverter";

function AvailablePlayers({ availablePlayers, playerSelectionClick }) {
  const clickHandler = (record) => {
    if (window.confirm(`Are you sure you wish to draft ${record.player}?`)){
    playerSelectionClick(record.key);
    }
  };

  const columns = [
    {
      title: "WR",
      dataIndex: "wr",
      width: 20,
    },
    {
      title: "Player",
      dataIndex: "player",
      width: 50,
      render: text => <a onRow={(record) => ({
        onClick: () => {
          clickHandler(record.key);
        },
      })}>{text}</a>,
    },
    {
      title: "",
      dataIndex: "imageURL",
      width: 20,
      render: (theImageURL) => <img alt={theImageURL} src={theImageURL} />,
    },
    {
      title: "",
      dataIndex: "Button",
      width: 20,
      render: () => <Button onRow={(record) => ({
        onClick: () => {
          clickHandler(record.key);
        },
      })}>select</Button>,
    },
  ];

  const data = [];
  for (let i = 1; i < availablePlayers.length; i++) {
    data.push({
      key: i,
      wr: "?",
      player: `${availablePlayers[i].first_name} ${availablePlayers[i].last_name}`,
      imageURL: `https://www.countryflags.io/${countryIsoConverter(
        availablePlayers[i].country
      )}/shiny/24.png`,
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
      />
    </div>
  );
}

AvailablePlayers.propTypes = {};

export default AvailablePlayers;
