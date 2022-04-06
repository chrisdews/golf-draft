import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Button, Progress } from "antd";

import Header from "../header";
import LiveLeaderboard from "../liveLeaderboard";
import apiMock from "../../hardcodedContent/players";
import leaderboardMock from "../../hardcodedContent/leaderboard";
import UserDraftsList from "../../components/userDraftsList";
import { Context } from "../../../context/provider";

const useHardCodedContent = process.env.NEXT_PUBLIC_MOCK_ENV === "mock";

import firebaseInit from "../../helpers/firebaseInit";

const database = firebaseInit();

function GolfDraft() {
  const { state, dispatch } = useContext(Context);

  const [isLoading, setIsLoading] = useState(true);
  const [tournamentInfo, setTournamentInfo] = useState([]);
  const [liveLeaderboard, setLiveLeaderboard] = useState([]);
  const [userDraftList, setUserDraftList] = useState({});

  const { isLoggedIn, userDrafts } = state;
  const userId = state.userData.uid;

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
    await fetch(`https://golf-leaderboard-data.p.rapidapi.com/entry-list/${process.env.NEXT_PUBLIC_TOURNAMENT_ID}`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.NEXT_PUBLIC_API_KEY,
        "x-rapidapi-host": "golf-leaderboard-data.p.rapidapi.com",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setTournamentInfo(res.results.tournament);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getTournamentLiveLeaderboard = async () => {
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
        setLiveLeaderboard(res.results.leaderboard);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      {!isLoading && (
        <>
          <Row gutter={16}>
            <Col className="gutter-row" span={12}>
              {liveLeaderboard[0] && (
                <Header
                  tournamentInfo={tournamentInfo}
                  leader={liveLeaderboard}
                />
              )}
            </Col>
          </Row>

          {isLoggedIn ? (
            <>
              <h3>
                Welcome {state.userData.displayName}, Here are your existing
                drafts:
              </h3>
              <UserDraftsList drafts={userDrafts?.drafts} />
            </>
          ) : (
            <Row>sign in to create/view drafts</Row>
          )}

          {
            <Row gutter={16}>
              <Col className="gutter-row" span={18}>
                <LiveLeaderboard
                  liveLeaderboard={liveLeaderboard}
                  // add a selected by % to the welcome leaderboard
                />
              </Col>
            </Row>
          }
        </>
      )}
    </div>
  );
}

GolfDraft.propTypes = {};

export default GolfDraft;
