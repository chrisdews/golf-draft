import React, { useState } from "react";
import PropTypes from "prop-types";
import GolfDraft from '../golfDraft'
import firebaseLogin from '../../helpers/firbaseLogin'

import { Button, Layout, Menu, Breadcrumb } from "antd";
const { Header, Content, Footer } = Layout;


function HomeLayout() {

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const signInClickHandler = async () => {
    let loginResponse = await firebaseLogin()
    console.log('==========', loginResponse)
    setUser(loginResponse)
    if(loginResponse.displayName){
      setIsLoggedIn(true)
    }
  }

  return (
    <div>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]}>
            <Menu.Item key="1">nav 1</Menu.Item>
            <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item>
            <Button onClick={() => {signInClickHandler()}}>{isLoggedIn ? 'sign out' : 'sign in'}</Button>
            <span>{isLoggedIn && `logged in as: ${user.displayName}`}</span> 
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>


          <div className="site-layout-content">
            <GolfDraft />
          </div>
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


