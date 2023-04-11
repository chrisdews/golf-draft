import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Button, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import Link from "next/link";

import Header from "../tournamentInfo";
import apiMock from "../../hardcodedContent/players";
import leaderboardMock from "../../hardcodedContent/leaderboard";
import UserDraftsList from "../../components/userDraftsList";
import { Context } from "../../../context/provider";
import firebaseInit from "../../helpers/firebaseInit";

const useHardCodedContent = process.env.NEXT_PUBLIC_MOCK_ENV === "mock";

const database = firebaseInit();

function GolfDraft() {
  const { state, dispatch } = useContext(Context);

  const [isLoading, setIsLoading] = useState(true);
  const [nextPgaEvent, setNextPgaEvent] = useState([]);
  const [errorText, setErrorText] = useState();

  const { isLoggedIn, userDrafts } = state;


  // useEffect(() => {
  //   if (useHardCodedContent) {
  //     setTournamentInfo(apiMock.results.tournament);
  //     let leaderboard = leaderboardMock.leaderboard;
  //     // setLiveLeaderboard(leaderboard);
  //     setIsLoading(false);
  //   } else {
  //     // getTournamentPlayerData();
  //     // getTournamentLiveLeaderboard();
  //   }
  // }, []);

  useEffect(() => {
    getNextPgaTourEvent();
  }, []);

  const getNextPgaTourEvent = async () => {
    console.log("get tours list called =========");
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/tours`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY,
          "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        const filterLatestPgaEvent = res?.results?.filter(tour => tour?.active).filter(tour => tour?.tour_name === 'US PGA Tour')?.[0]
        getNextPgaEvent(filterLatestPgaEvent)
      })
      .catch((err) => {
        // setErrorText(err.toString());
        console.error(err);
      });
  }

  const getNextPgaEvent = async (filterLatestPgaEvent) => {
    console.log("get tournaments list called =========");

    const { tour_id, season_id } = filterLatestPgaEvent
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/fixtures/${tour_id}/${season_id}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY,
          "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        const filteredResults = res?.results?.filter(tournament => tournament?.type === 'Stroke Play').filter(tournament => Date.parse(tournament?.end_date) > Date.now()).sort((a, b) => Date.parse(a?.start_date) - Date.parse(b?.start_date))?.[0]
        setNextPgaEvent(filteredResults)
        setIsLoading(false);
      })
      .catch((err) => {
        // setErrorText(err.toString());
        console.error(err);
      });
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
                "justifyContent": "center",
                width: "100vw",
                "flexDirection": "column",
                "alignItems": "center",
              }}
            >
              <h1
                style={{
                  "fontSize": "50px",
                  "marginBottom": "0px",
                  color: "green",
                }}
              >
                GOLF DRAFT
              </h1>
              <h5 style={{ "marginBottom": "30px" }}>
                The simple PGA tour drafting game.
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
              <Col className="gutter-row" span={12}>
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
                  style={{
                    width: "80px",
                    "marginRight": "3px",
                    "marginBottom": "3px",
                  }}
                  disabled={isLoading}
                >
                  Create
                </Button>
              </Link>
              Create a new draft and share the ID
              <Link href="/join">
                <Button
                  style={{
                    width: "80px",
                    "marginRight": "3px",
                    "marginBottom": "3px",
                  }}
                >
                  Join
                </Button>
              </Link>
              If you have a share ID enter it here
              <h3>
                Welcome {state.userData.displayName}, Here are your existing
                drafts:
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
  );
}

GolfDraft.propTypes = {};

export default GolfDraft;
