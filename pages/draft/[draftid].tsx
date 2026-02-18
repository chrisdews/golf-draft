import React, { useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import firebaseInit from "../../src/helpers/firebaseInit"
import firebase from "firebase/app"
import type { NextPage } from "next"

import { Row, Col, Button, Progress, Alert } from "antd"
import { CheckSquareOutlined, LoadingOutlined } from "@ant-design/icons"

import { Context } from "../../context/provider"

import DraftHistory from "../../src/components/draftHistory"
import AvailablePlayers from "../../src/components/availablePlayers"
import TournamentInfo from "../../src/components/tournamentInfo"
import LiveLeaderboard from "../../src/components/liveLeaderboard"
import UsersList from "../../src/components/usersList"
import sortUsers from "../../src/helpers/sortUsers"

import apiMock from "../../src/hardcodedContent/players"
import leaderboardMock from "../../src/hardcodedContent/leaderboard"

import {
  DraftUser,
  AvailablePlayerMap,
  SelectedPlayer,
  DraftInfo,
  TournamentInfo as TournamentInfoType,
  LeaderboardEntry,
  isAuthenticatedUser,
} from "../../src/types"

const useHardCodedContent = process.env.NEXT_PUBLIC_MOCK_ENV === "mock"

const Drafts: NextPage = () => {
  const database = firebaseInit()
  const router = useRouter()
  const rawDraftId = router.query.draftid
  const draftid = Array.isArray(rawDraftId) ? rawDraftId[0] : rawDraftId

  const { state } = useContext(Context)
  const draftId = draftid

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [playerEntryList, setPlayerEntryList] = useState<AvailablePlayerMap>({})
  const [availablePlayerList, setAvailablePlayerList] = useState<AvailablePlayerMap | null>(null)
  const [tournamentInfo, setTournamentInfo] = useState<TournamentInfoType | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[] | null>(null)
  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentPick, setCurrentPick] = useState<number>(0)
  const [whosTurn, setWhosTurn] = useState<SelectedPlayer | null>(null)
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false)
  const [draftStarted, setDraftStarted] = useState<boolean>(false)
  const [users, setUsers] = useState<DraftUser[]>([])
  const [draftInfo, setDraftInfo] = useState<Partial<DraftInfo>>({})
  const [draftFinished, setDraftFinished] = useState<boolean>(false)
  const [copyClicked, setCopyClicked] = useState<boolean>(false)
  const [randomiseLoading, setRandomiseLoading] = useState<boolean>(false)

  const { isLoggedIn, userData } = state

  useEffect(() => {
    if (draftid) {
      const draftRef = database.ref("drafts/" + draftid)
      draftRef.on("value", (snapshot) => {
        const data = snapshot.val() as Partial<DraftInfo> | null
        if (data) setDraftInfo(data)
      })
    }
  }, [draftid])

  useEffect(() => {
    if (draftid) {
      const draftRef = database.ref("drafts/" + draftid + "/picks")
      draftRef.on("value", (snapshot) => {
        const data = snapshot.val() as SelectedPlayer[] | null
        setSelectedPlayers(data)
      })
    }
  }, [])

  useEffect(() => {
    const currentPickRef = database.ref("drafts/" + draftid + "/currentPick")
    currentPickRef.on("value", (snapshot) => {
      const data = snapshot.val() as number | null
      setCurrentPick(data ?? 0)
    })
  }, [])

  useEffect(() => {
    const availablePlayersRef = database.ref("drafts/" + draftid + "/availablePlayers")
    availablePlayersRef.on("value", (snapshot) => {
      const data = snapshot.val() as AvailablePlayerMap | null
      setAvailablePlayerList(data)
    })
  }, [whosTurn])

  useEffect(() => {
    if (useHardCodedContent) {
      setTournamentInfo(apiMock.results.tournament as unknown as TournamentInfoType)
      setPlayerEntryList(Object.assign({}, apiMock.results.entry_list) as unknown as AvailablePlayerMap)
      setLiveLeaderboard(leaderboardMock.leaderboard)
      setIsLoading(false)
    } else {
      if (draftInfo.tournamentId) {
        getTournamentPlayerData()
        getTournamentLiveLeaderboard()
      }
    }
  }, [draftInfo])

  useEffect(() => {
    getSelectedPlayers()
  }, [currentPick])

  useEffect(() => {
    if (!draftId) return
    const draftRef = database.ref("drafts/" + draftId)
    draftRef.on("value", (snapshot) => {
      const data = snapshot.val() as { draftFinished?: boolean } | null
      if (data?.draftFinished) {
        setDraftFinished(true)
      }
    })
  }, [currentPick])

  const getSelectedPlayers = () => {
    if (!draftId) return
    const selectedPlayersRef = database.ref("drafts/" + draftId + "/picks")
    selectedPlayersRef.on("value", (snapshot) => {
      const data = snapshot.val() as SelectedPlayer[] | null
      setSelectedPlayers(data)
      if (data) {
        setDraftStarted(true)
        setWhosTurn(data[currentPick - 1] ?? null)
      }
    })
  }

  const getTournamentPlayerData = async () => {
    console.log("get tournament api called ====")
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/entry-list/${draftInfo?.tournamentId}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY!,
          "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
        },
      }
    )
      .then((res) => res.json())
      .then((res: { results: { tournament: TournamentInfoType; entry_list: AvailablePlayerMap } }) => {
        setTournamentInfo(res.results.tournament)
        setPlayerEntryList(Object.assign({}, res.results.entry_list) as AvailablePlayerMap)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getTournamentLiveLeaderboard = async () => {
    console.log("get leaderboard api called ====")
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/leaderboard/${draftInfo?.tournamentId}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY!,
          "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
        },
      }
    )
      .then((res) => res.json())
      .then((res: { results: { leaderboard: LeaderboardEntry[] } }) => {
        setLiveLeaderboard(res.results.leaderboard)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const resetDraft = async () => {
    if (!draftId) return
    if (window.confirm("Are you sure you wish to delete this item?")) {
      database.ref("drafts/" + draftId + "/picks").remove()
      database.ref("drafts/" + draftId + "/availablePlayers").set(playerEntryList)
      database.ref("drafts/" + draftId).child("currentPick").set(0)
      database.ref("drafts/" + draftId).child("draftFinished").set(false)
      setDraftStarted(false)
      setDraftFinished(false)
    }
  }

  const getCurrentTurnUser = (index: number): DraftUser | undefined => {
    const userCount = users.length
    const overall = index + 1
    const round = Math.floor((overall - 1) / userCount + 1)
    const pick = ((overall - 1) % userCount) + 1
    const team_pick = round % 2 ? pick : round * userCount - overall + 1
    return users[team_pick - 1]
  }

  const createInitialDraftArray = (roundsNum: number): SelectedPlayer[] => {
    const picksNum = roundsNum * users.length
    return Array.from({ length: picksNum }).map((_, index) => {
      const pickId = index + 1
      const user = getCurrentTurnUser(index)
      return {
        id: user?.id ?? '',
        pick: pickId,
        userId: user?.id ?? '',
        username: user?.displayName ?? '',
      }
    })
  }

  const numberOfRoundsCalc = (): number => {
    const userCount = users.length
    if (userCount < 2.5) return 12
    if (userCount < 3.5) return 10
    if (userCount < 6.5) return 8
    if (userCount < 10.5) return 6
    return 4
  }

  const startDraft = () => {
    if (!draftId) return
    database.ref("drafts/" + draftId + "/picks").update(createInitialDraftArray(numberOfRoundsCalc()))
    setInitialDraftPlayerData()
    incrementCurrentPick()
    setDraftStarted(true)
  }

  const setInitialDraftPlayerData = () => {
    if (!draftId) return
    const availablePlayersRef = database.ref("drafts/" + draftId + "/availablePlayers")
    availablePlayersRef.update(playerEntryList)
  }

  const incrementCurrentPick = () => {
    if (!draftId) return
    database.ref("drafts/" + draftId).child("currentPick").set(firebase.database.ServerValue.increment(1))
  }

  const writePickData = (draftId: string, player: Record<string, unknown>) => {
    const selectedPlayersRef = database.ref("drafts/" + draftId + "/picks")
    const updatePick = selectedPlayersRef.child(String(currentPick - 1))
    updatePick.update({
      player_country: player?.country,
      player_first_name: player?.first_name,
      player_last_name: player?.last_name,
      player_id: player?.player_id,
    })
  }

  const updateAvailablePlayersList = (draftId: string, player: Record<string, unknown>, id: number, whosTurn: SelectedPlayer) => {
    const selectedPlayersRef = database.ref("drafts/" + draftId + "/availablePlayers")
    const selectedPlayerRef = selectedPlayersRef.child(String(id))
    selectedPlayerRef.update({ selectedBy: whosTurn })
  }

  const updateServerDraftFinished = (draftId: string) => {
    database.ref("drafts/" + draftId).child("draftFinished").set(true)
  }

  const playerSelectionClick = (id: number) => {
    if (!whosTurn || !draftId || !availablePlayerList) return
    const player = { ...availablePlayerList[String(id)] } as Record<string, unknown>
    writePickData(draftId, player)
    updateAvailablePlayersList(draftId, player, id, whosTurn)

    if (selectedPlayers && currentPick < selectedPlayers.length) {
      incrementCurrentPick()
    } else {
      updateServerDraftFinished(draftId)
      setDraftFinished(true)
      incrementCurrentPick()
    }
  }

  const getUsers = () => {
    if (!draftId) return
    const userListRef = database.ref("drafts/" + draftId + "/users")
    userListRef.on("value", (snapshot) => {
      const usersData = snapshot.val()
      const sortedUsers = sortUsers(usersData)
      setUsers(sortedUsers)
    })
  }

  useEffect(() => {
    getUsers()
  }, [])

  const adminDraftSettingsCheck = (): boolean => {
    if (!isAuthenticatedUser(userData)) return true

    const loggedInDraftUser = users.find((user) => user.id === userData.uid)

    if (users && userData && loggedInDraftUser?.role !== "admin") return true
    if (draftStarted || !isLoggedIn || users?.length < 1) return true

    return false
  }

  const draftProgress = (selectedPlayers: SelectedPlayer[] | null, currentPick: number, draftFinished: boolean): JSX.Element | null => {
    if (isLoading) return <LoadingOutlined />
    if (!currentPick) return null

    if (selectedPlayers) {
      return (
        <>
          <Progress
            percent={(currentPick / selectedPlayers.length) * 100}
            format={() => `${currentPick - 1} / ${selectedPlayers.length}`}
            status={draftFinished ? undefined : "active"}
          />
          {draftFinished ? (
            <h3>DRAFT COMPLETE, GOOD LUCK!</h3>
          ) : (
            <h5>Draft Progress</h5>
          )}
        </>
      )
    }

    return null
  }

  const loggedOutNotice = (): JSX.Element | false => {
    return (
      !isLoggedIn && (
        <Alert
          message="Logged Out!"
          description="You must be logged in to participate."
          type="error"
          closable
        />
      )
    )
  }

  const draftHeader = (): JSX.Element => {
    return <h1>{draftInfo?.draftName}</h1>
  }

  const tournamentHeader = (): JSX.Element | null => {
    if (isLoading) return <LoadingOutlined />

    return (
      liveLeaderboard[0] ? (
        <TournamentInfo nextPgaEvent={tournamentInfo} />
      ) : null
    )
  }

  const whosTurnDisplay = (): JSX.Element | null => {
    if (isLoading) return <LoadingOutlined />
    if (!whosTurn) return null

    const { username } = whosTurn

    return (
      selectedPlayers ? (
        <>
          <span>
            Picking Now: <h3>{username}</h3>
          </span>
        </>
      ) : null
    )
  }

  const copyToClipboard = () => {
    if (!draftId) return
    navigator.clipboard.writeText(draftId).then(
      () => { setCopyClicked(true) },
      () => { setCopyClicked(false) }
    )
  }

  function iterateWithDelay(users: DraftUser[], delay: number, callback: (result: string) => void): void {
    const draftRef = database.ref("drafts/" + draftid)
    let i = 0
    const intervalId = setInterval(() => {
      const userRef = draftRef.child("users").child(users[i].id)
      userRef.update({ draftOrderWeight: Math.random() })

      i++
      if (i === users.length) {
        clearInterval(intervalId)
        callback('finished')
      }
    }, delay)
  }

  const randomiseDraftOrder = () => {
    setRandomiseLoading(true)
    iterateWithDelay(users, 1000, () => {
      setRandomiseLoading(false)
    })
  }

  return (
    <>
      {loggedOutNotice()}
      {draftHeader()}
      {tournamentHeader()}
      {whosTurnDisplay()}
      {draftProgress(selectedPlayers, currentPick, draftFinished)}

      {!isLoading && (
        <>
          <p>
            Draft ID: {draftid}{" "}
            <Button onClick={copyToClipboard}>
              Copy SHARE ID to Clipboard
            </Button>
            {copyClicked && (
              <CheckSquareOutlined style={{ color: "green", marginLeft: "10px" }} />
            )}
          </p>

          <Button disabled={adminDraftSettingsCheck()} onClick={() => { startDraft() }}>
            Start Draft
          </Button>
          <Button onClick={() => { setShowLeaderboard(!showLeaderboard) }}>
            {showLeaderboard ? "Show Draft" : "Show Leaderboard"}
          </Button>
          <Button
            disabled={adminDraftSettingsCheck()}
            loading={randomiseLoading}
            onClick={() => { randomiseDraftOrder() }}
          >
            Randomise Order
          </Button>
          {!draftStarted && <p>Only the draft admin can start the draft</p>}

          <UsersList users={users} />

          {!showLeaderboard && (
            <>
              <Row gutter={16}>
                <AvailablePlayers
                  availablePlayerList={availablePlayerList}
                  playerSelectionClick={playerSelectionClick}
                  currentPick={currentPick}
                  userData={userData}
                  currentTurnData={whosTurn}
                  isLoggedIn={isLoggedIn}
                  draftFinished={draftFinished}
                />
              </Row>
              <Row>
                {currentPick > 0 && (
                  <DraftHistory selectedPlayers={selectedPlayers} />
                )}
              </Row>
            </>
          )}

          {showLeaderboard && selectedPlayers && isLoggedIn && (
            <Row gutter={16}>
              <LiveLeaderboard
                liveLeaderboard={liveLeaderboard}
                selectedPlayers={selectedPlayers}
              />
            </Row>
          )}
        </>
      )}
    </>
  )
}

export default Drafts
