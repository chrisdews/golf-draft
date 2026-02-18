import React from "react"
import { Table, Button } from "antd"
import countryIsoConverter from "../../helpers/countryIsoCoverter"
import { AvailablePlayer, AvailablePlayerMap, SelectedPlayer, UserData, isAuthenticatedUser } from "../../types"

interface AvailablePlayersProps {
  availablePlayerList: AvailablePlayerMap | null
  playerSelectionClick: (id: number) => void
  currentPick: number
  userData: UserData
  currentTurnData: Pick<SelectedPlayer, 'userId' | 'username'> | null
  isLoggedIn: boolean
  draftFinished: boolean
}

interface TableRow {
  key: number
  wr: string
  flagImage: string | undefined
  player: string
  selectedBy: string | undefined
}

function AvailablePlayers({
  availablePlayerList,
  playerSelectionClick,
  currentPick,
  userData,
  currentTurnData,
  isLoggedIn,
  draftFinished,
}: AvailablePlayersProps) {
  if (!isLoggedIn) return null
  if (availablePlayerList === null) return null
  if (draftFinished) return null

  const clickHandler = (record: TableRow, e: React.MouseEvent) => {
    e.preventDefault()
    if (window.confirm(`Are you sure you wish to draft ${record.player}?`)) {
      playerSelectionClick(record.key)
    }
  }

  const disablePicks = (): boolean => {
    if (
      currentPick !== 0 &&
      currentTurnData &&
      isAuthenticatedUser(userData) &&
      userData.uid === currentTurnData.userId
    ) {
      return false
    }
    return true
  }

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
      render: (flagImage: string | undefined) => (
        <img
          alt={flagImage}
          src={`/img/country-flags-main/svg/${flagImage?.toLowerCase()}.svg`}
        />
      ),
    },
    {
      title: "Player",
      dataIndex: "player",
      width: 35,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "",
      dataIndex: "Button",
      width: 25,
      render: (_text: unknown, record: TableRow) =>
        record.selectedBy ? (
          record.selectedBy
        ) : (
          <Button
            disabled={disablePicks() || draftFinished}
            onClick={(e) => {
              clickHandler(record, e)
            }}
          >
            select
          </Button>
        ),
    },
  ]

  const data: TableRow[] = []

  const players: AvailablePlayer[] = Object.values(availablePlayerList)
  for (let i = 0; i < players.length; i++) {
    const worldRanking = "TBC"
    const firstName = players[i]?.first_name
    const lastName = players[i]?.last_name
    const flagImage = players[i]?.country
      ? countryIsoConverter(players[i]?.country)
      : ""
    const selectedBy = players[i]?.selectedBy?.username

    data.push({
      key: i,
      wr: worldRanking,
      flagImage: flagImage,
      player: `${firstName} ${lastName}`,
      selectedBy: selectedBy,
    })
  }

  const style = { padding: "8px" }

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
  )
}

export default AvailablePlayers
