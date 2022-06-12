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
  const [tournamentInfo, setTournamentInfo] = useState([]);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [errorText, setErrorText] = useState();

  const { isLoggedIn, userDrafts } = state;

  useEffect(() => {
    if (useHardCodedContent) {
      setTournamentInfo(apiMock.results.tournament);
      let leaderboard = leaderboardMock.leaderboard;
      setLiveLeaderboard(leaderboard);
      setIsLoading(false);
    } else {
      getTournamentPlayerData();
      getTournamentLiveLeaderboard();
    }
  }, []);

  const getTournamentPlayerData = async () => {
    console.log("get player data called =========");
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/entry-list/${process.env.NEXT_PUBLIC_TOURNAMENT_ID}`,
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
        setTournamentInfo(res?.results?.tournament);
        setIsLoading(false);
      })
      .catch((err) => {
        setErrorText(err.toString());
        console.error(err);
      });
  };

  const getTournamentLiveLeaderboard = async () => {
    console.log("get tournament data called =========");

    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/leaderboard/${process.env.NEXT_PUBLIC_TOURNAMENT_ID}`,
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
        setLiveLeaderboard(res?.results?.leaderboard);
      })
      .catch((err) => {
        console.log({ err }, typeof err);
        setErrorText(err.toString());
        console.error(err);
      });
  };

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

          {!tournamentInfo?.id ? (
            <Alert
              message="Something went wrong.."
              description="There is no tournament data at this time - possibly because I didn't pay for the data"
              type="error"
            />
          ) : (
            <Row gutter={16}>
              <Col className="gutter-row" span={12}>
                {tournamentInfo?.id && (
                  <>
                    The next tournament is:
                    <Header tournamentInfo={tournamentInfo} />
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
                  disabled={!tournamentInfo?.id}
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
