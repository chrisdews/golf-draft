import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import firebase from "firebase/app";
import firebaseLogin from "../../helpers/firebaseLogin";
import firebaseInit from "../../helpers/firebaseInit";
import { Context } from "../../../context/provider";

const database = firebaseInit();

import { Button, Layout, Menu, Breadcrumb, Avatar, Image } from "antd";
const { Header, Content, Footer } = Layout;

function HomeLayout({ children }) {
  const { state, dispatch } = useContext(Context);
  const { userData } = state;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDrafts, setUserDrafts] = useState({});

  const signInClickHandler = async () => {
    if (isLoggedIn) {
      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log("logged out");
          dispatch({
            type: "SET_USER_DATA",
            payload: { displayName: null },
          });
          setIsLoggedIn(false);
          // Sign-out successful.
        })
        .catch((error) => {
          console.log(error);
          // An error happened.
        });
    } else {
      let loginResponse = await firebaseLogin();
      if (loginResponse.displayName) {
        setIsLoggedIn(true);
        addUserToDb(loginResponse);
        getUserFromDb(loginResponse);
        dispatch({
          type: "SET_USER_DATA",
          payload: loginResponse,
        });
        // add the user to our database.
      }
    }
  };

  const getUserFromDb = (loginResponse) => {
    const userId = loginResponse.uid;

    const existingUser = database.ref("users/" + userId);
    existingUser.on("value", (snapshot) => {
      const data = snapshot.val();
      setUserDrafts(data);
    });
  };

  // not used yet, need to use when signing up.
  const addUserToDb = (loginResponse) => {
    let userId = loginResponse.uid;
    const ref = database.ref("users");
    // need to add check here to make sure we dont overwrite the user's drafts with null
    ref.child(userId).set({
      email: loginResponse.email,
      displayName: loginResponse.displayName,
    });
    console.log("added user to db");
  };

  // firebase.auth().onAuthStateChanged(function (userData) {
  //   if (userData) {
  //     return;
  //   } else {
  //     setIsLoggedIn(false);
  //     dispatch({
  //       type: "SET_USER_DATA",
  //       payload: { displayName: null },
  //     });
  //   }
  // });

  const createDraftGameClickHandler = (userData) => {
    const userId = userData.uid;

    const newDraft = database.ref("drafts/");

    const draft = newDraft.push({
      users: { userId },
      draftName: 'test'
    });

    const newDraftId = draft.key;
    console.log(newDraftId)

    const existingUser = database.ref("users/" + userId);
    existingUser.child('drafts').child(newDraftId).set({name: 'test'});
  };

  return (
    <div>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]}>
            <Menu.Item key="1">nav 1</Menu.Item>
            <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item>
            {isLoggedIn && (
              <div style={{ float: "right" }}>
                <span>{`logged in: ${userData.displayName}`}</span>
                <Avatar
                  style={{ margin: "0.5em" }}
                  src={<Image src={userData.photoURL} />}
                />
              </div>
            )}
            <Button
              onClick={() => {
                signInClickHandler();
              }}
            >
              {isLoggedIn ? "sign out" : "sign in"}
            </Button>
            <Button
              onClick={() => {
                createDraftGameClickHandler(userData);
              }}
            >
              Create
            </Button>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>

          <div className="site-layout-content">{children}</div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          GolfDraft ©2021 Created by Chris Dews & Xander Johnston
        </Footer>
      </Layout>
    </div>
  );
}

Layout.propTypes = {};

export default HomeLayout;
