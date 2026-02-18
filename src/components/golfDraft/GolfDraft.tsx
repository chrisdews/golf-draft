import React, { useContext, useEffect, useState } from "react"
import { Row, Col, Button, Alert } from "antd"
import { LoadingOutlined } from "@ant-design/icons"
import Link from "next/link"
import Header from "../tournamentInfo"
import UserDraftsList from "../../components/userDraftsList"
import { Context } from "../../../context/provider"
import FlagIcon from "../flagIcon"
import { Fixture, Tour } from "../../types"

function GolfDraft() {
  const { state } = useContext(Context)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [nextPgaEvent, setNextPgaEvent] = useState<Fixture | null>(null)
  const [errorText, setErrorText] = useState<string | undefined>()
  const { isLoggedIn, userDrafts } = state

  useEffect(() => {
    getNextPgaTourEvent()
  }, [])

  const getNextPgaTourEvent = async () => {
    console.log("get tours list called =========")
    await fetch(`https://golf-leaderboard-data.p.rapidapi.com/tours`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY!,
        "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
      },
    })
      .then((res) => res.json())
      .then((res: { results: Tour[] }) => {
        const filterLatestPgaEvent = res?.results
          ?.filter((tour) => tour?.active)
          .filter((tour) => tour?.tour_name === 'US PGA Tour')?.[0]
        if (filterLatestPgaEvent) {
          getNextPgaEvent(filterLatestPgaEvent)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getNextPgaEvent = async (filterLatestPgaEvent: Tour) => {
    console.log("get tournaments list called =========")
    const { tour_id, season_id } = filterLatestPgaEvent
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/fixtures/${tour_id}/${season_id}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY!,
          "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
        },
      }
    )
      .then((res) => res.json())
      .then((res: { results: Fixture[] }) => {
        const filteredResults = res?.results
          ?.filter((tournament) => tournament?.type === 'Stroke Play')
          .filter((tournament) => Date.parse(tournament?.end_date) > Date.now())
          .sort((a, b) => Date.parse(a?.start_date) - Date.parse(b?.start_date))?.[0]
        setNextPgaEvent(filteredResults ?? null)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <div>
      {isLoading && <LoadingOutlined />}

      {errorText && (
        <Alert
          message="Something went wrong.."
          description={errorText}
          type="error"
        />
      )}

      {!isLoading && (
        <>
          <Row gutter={16}>
            <span
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h1
                style={{
                  fontSize: "26px",
                  marginBottom: "0px",
                  color: "green",
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: "center"
                }}
              >
                <span>GOLF</span>
                <span style={{ display: 'flex', justifyContent: 'center', height: '40px', width: '50px' }}>
                  <FlagIcon />
                </span>
                <span>DRAFT</span>
              </h1>
              <h5 style={{ marginBottom: "30px" }}>
                pick the winner
              </h5>
            </span>
          </Row>

          {!nextPgaEvent?.id ? (
            <Alert
              message="Something went wrong.."
              description="There is no tournament data at this time - possibly because I didn't pay for the data"
              type="error"
            />
          ) : (
            <Row gutter={16}>
              <Col className="gutter-row" span={16}>
                {nextPgaEvent?.id && (
                  <>
                    The next PGA tournament is:
                    <Header nextPgaEvent={nextPgaEvent} />
                  </>
                )}
              </Col>
            </Row>
          )}

          {isLoggedIn ? (
            <>
              <Link href="/create">
                <Button
                  style={{ width: "80px", marginRight: "3px", marginBottom: "3px" }}
                  disabled={isLoading}
                >
                  Create
                </Button>
              </Link>
              Create a new draft and share the ID
              <Link href="/join">
                <Button style={{ width: "80px", marginRight: "3px", marginBottom: "3px" }}>
                  Join
                </Button>
              </Link>
              If you have a share ID enter it here
              <h3>
                Welcome {state.userData.displayName}, Here are your existing drafts:
              </h3>
              <UserDraftsList drafts={userDrafts?.drafts} />
              <Row>
                <Alert
                  message="This Game is Work in Progress"
                  description="Don't blame me if something goes wrong at this point! - Chris Dews"
                  type="warning"
                />
              </Row>
            </>
          ) : (
            <Row>
              <Alert
                message="You are logged out"
                description="Sign in with a google account to create or view your drafts"
                type="info"
              />
            </Row>
          )}
        </>
      )}
    </div>
  )
}

export default GolfDraft
