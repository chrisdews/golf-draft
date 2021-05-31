import React, { useState } from "react";
import PropTypes from "prop-types";
import firebase from "firebase/app";
import firebaseLogin from "../../helpers/firebaseLogin";

import { Button, Layout, Menu, Breadcrumb, Avatar, Image } from "antd";
const { Header, Content, Footer } = Layout;

function HomeLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const signInClickHandler = async () => {
    if (isLoggedIn) {
      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log("logged out");
          // Sign-out successful.
        })
        .catch((error) => {
          console.log(error);
          // An error happened.
        });
    } else {
      let loginResponse = await firebaseLogin();
      console.log("==========", loginResponse);
      setUser(loginResponse);
      if (loginResponse.displayName) {
        setIsLoggedIn(true);
      }
    }
  };

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      setUser(user);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  });

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
                <span>{`logged in: ${user.displayName}`}</span>
                <Avatar
                  style={{ margin: "0.5em" }}
                  src={<Image src={user.photoURL} />}
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
