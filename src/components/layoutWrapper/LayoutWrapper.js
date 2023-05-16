import React, { useState, useContext } from "react";
import Link from "next/link";
import firebase from "firebase/app";
import firebaseLogin from "../../helpers/firebaseLogin";
import firebaseInit from "../../helpers/firebaseInit";
import { Context } from "../../../context/provider";
import { GoogleOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, Breadcrumb, Avatar, Image } from "antd";
import FlagIcon from "../flagIcon";

const database = firebaseInit();

const { Header, Content, Footer } = Layout;

function LayoutWrapper({ children }) {
  const { state, dispatch } = useContext(Context);
  const { userData, isLoggedIn } = state;

  const signIn = () => {
    dispatch({
      type: "SET_LOGGED_IN",
      payload: true,
    });
  };

  const signOut = () => {
    dispatch({
      type: "SET_LOGGED_IN",
      payload: false,
    });
  };

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
          signOut();
          // setIsLoggedIn(false);
          // Sign-out successful.
        })
        .catch((error) => {
          console.log(error);
          // An error happened.
        });
    } else {
      let loginResponse = await firebaseLogin();
      if (loginResponse.displayName) {
        signIn();
        getUserOrAddToDb(loginResponse);
        // getUserFromDb(loginResponse);
        dispatch({
          type: "SET_USER_DATA",
          payload: loginResponse,
        });
        // add the user to our database.
      }
    }
  };

  const getUserOrAddToDb = (loginResponse) => {
    let userId = loginResponse.uid;

    const existingUser = database.ref("users/" + userId);

    existingUser.on("value", (snapshot) => {
      const data = snapshot.val();

      if (data) {
        dispatch({
          type: "SET_USER_DRAFT_DATA",
          payload: data,
        });
      } else {
        createNewUser(loginResponse, userId);
      }
    });
  };

  const createNewUser = (loginResponse, userId) => {
    const ref = database.ref("users");

    let data = {
      email: loginResponse.email,
      displayName: loginResponse.displayName,
      drafts: null,
    };

    ref.child(userId).set(data);
    dispatch({
      type: "SET_USER_DATA",
      payload: loginResponse,
    });

    console.log("added user to db");
  };

  return (
    <div>
      <Layout className="layout" style={{ width: "100%" }}>
        <Header style={{ padding: "0px" }}>
          <div className="logo" />
          <span>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
              <Menu.Item key="1" style={{width: '85px'}} >
                <Link href="/"  >
                  <span style={{height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px'}}>

                  <FlagIcon />
                  </span>
                </Link>
              </Menu.Item>

              <span style={{ display: "flex", justifyContent: "flex-end", width: "100%", alignItems: "center" }}>
                {isLoggedIn && (
                  <>
                    <span>
                      {userData?.displayName?.split(" ")[0] || "username"}
                    </span>
                    <Avatar
                      style={{ margin: "0.5em" }}
                      src={<Image src={userData.photoURL} />}
                    />
                  </>
                )}
                <Button
                  onClick={() => {
                    signInClickHandler();
                  }}
                  style={{ "marginRight": "15px" }}
                >
                  {isLoggedIn ? "sign out" : "sign in"}
                </Button>
              </span>
              {/* <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item> */}
            </Menu>
          </span>
        </Header>
        <Content style={{ padding: "10px 20px", "minHeight": "85vh" }}>
          {/* <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb> */}

          <div className="site-layout-content">{children}</div>
        </Content>
        <Footer style={{ textAlign: "center" }}>GolfDraft ©2021</Footer>
      </Layout>
    </div>
  );
}

Layout.propTypes = {};

export default LayoutWrapper;
