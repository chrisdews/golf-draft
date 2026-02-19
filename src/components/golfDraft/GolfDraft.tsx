import React, { useContext, useEffect, useState } from "react"
import { Row, Col, Button, Alert } from "antd"
import { LoadingOutlined } from "@ant-design/icons"
import Link from "next/link"
import Header from "../tournamentInfo"
import UserDraftsList from "../../components/userDraftsList"
import { Context } from "../../../context/provider"
import FlagIcon from "../flagIcon"
import { Fixture } from "../../types"
import { getTours, getFixtures } from "../../helpers/golfApi"

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
    try {
      const tours = await getTours()
      const pgaTour = tours
        .filter((tour) => tour?.active)
        .find((tour) => tour?.tour_name === 'US PGA Tour')
      if (pgaTour) {
        const fixtures = await getFixtures(pgaTour.tour_id, pgaTour.season_id)
        const nextEvent = fixtures
          .filter((t) => t?.type === 'Stroke Play')
          .filter((t) => Date.parse(t?.end_date) > Date.now())
          .sort((a, b) => Date.parse(a?.start_date) - Date.parse(b?.start_date))[0] ?? null
        setNextPgaEvent(nextEvent)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
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
