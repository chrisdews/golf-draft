import React from "react"
import { Table } from "antd"
import countryIsoConverter from "../../helpers/countryIsoCoverter"
import { LeaderboardEntry, SelectedPlayer } from "../../types"

interface LiveLeaderboardProps {
  liveLeaderboard: LeaderboardEntry[]
  selectedPlayers: SelectedPlayer[] | null
}

interface TableRow {
  key: number
  position: number
  player: string
  countryIso: string | undefined
  totalToPar: number
  holesPlayed: number
  owner: string | undefined
}

function LiveLeaderboard({ liveLeaderboard, selectedPlayers }: LiveLeaderboardProps) {
  const columns = [
    {
      title: "Player",
      dataIndex: "player",
      width: 30,
    },
    {
      title: "",
      dataIndex: "countryIso",
      width: 10,
      render: (flagImage: string | undefined) => (
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
  ]

  const data: TableRow[] = []

  for (let i = 0; i < liveLeaderboard.length; i++) {
    const playerId = liveLeaderboard[i].player_id
    const firstName = liveLeaderboard[i].first_name
    const lastName = liveLeaderboard[i].last_name
    const position = liveLeaderboard[i].position
    const countryIso = liveLeaderboard[i]?.country
      ? countryIsoConverter(liveLeaderboard[i]?.country)
      : ""
    const totalToPar = liveLeaderboard[i]?.total_to_par
    const holes_played = liveLeaderboard[i]?.holes_played
    const selected =
      selectedPlayers &&
      selectedPlayers.find((s) => s.player_id === playerId)
    const owner = selected ? selected.username : undefined

    data.push({
      key: i,
      position: position,
      player: `${firstName} ${lastName}`,
      countryIso: countryIso,
      totalToPar: totalToPar,
      holesPlayed: holes_played,
      owner: owner,
    })
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
  )
}

export default LiveLeaderboard
