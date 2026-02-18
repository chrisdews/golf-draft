import React from "react"
import { Table } from "antd"
import countryIsoConverter from "../../helpers/countryIsoCoverter"
import { SelectedPlayer } from "../../types"

interface DraftHistoryProps {
  selectedPlayers: SelectedPlayer[] | null
}

interface TableRow {
  key: number
  pick: number | undefined
  player: string
  username: string | undefined
  imageURL: string | undefined
}

function DraftHistory({ selectedPlayers }: DraftHistoryProps) {
  const columns = [
    {
      title: "No",
      dataIndex: "pick",
      width: 20,
    },
    {
      title: "User",
      dataIndex: "username",
      width: 40,
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
      render: (flagImage: string | undefined) => (
        <img
          alt={flagImage}
          src={`/img/country-flags-main/svg/${flagImage?.toLowerCase()}.svg`}
        />
      ),
    },
  ]

  const data: TableRow[] = []

  if (selectedPlayers) {
    for (let i = 0; i < selectedPlayers.length; i++) {
      const username = selectedPlayers[i]?.username
      const playername = selectedPlayers[i]?.player_last_name
        ? `${selectedPlayers[i].player_first_name} ${selectedPlayers[i]?.player_last_name}`
        : ""
      const imageURL = selectedPlayers[i]?.player_country
        ? countryIsoConverter(selectedPlayers[i]?.player_country as string)
        : ""
      const pick = selectedPlayers[i]?.pick
      data.push({
        key: i,
        pick: pick,
        player: playername,
        username: username,
        imageURL: imageURL,
      })
    }
  }

  const style = { padding: "8px" }

  return (
    <div style={style}>
      <h3>Draft History</h3>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ y: 540 }}
        size="small"
      />
    </div>
  )
}

export default DraftHistory
