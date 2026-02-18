import React, { ReactNode, useContext } from "react"
import Link from "next/link"
import firebase from "firebase/app"
import firebaseLogin from "../../helpers/firebaseLogin"
import firebaseInit from "../../helpers/firebaseInit"
import { Context } from "../../../context/provider"
import { GoogleOutlined } from "@ant-design/icons"
import { Button, Layout, Menu, Avatar, Image } from "antd"
import FlagIcon from "../flagIcon"
import { User, UserFirebaseData, isAuthenticatedUser } from "../../types"

const database = firebaseInit()

const { Header, Content, Footer } = Layout

interface LayoutWrapperProps {
  children: ReactNode
}

function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { state, dispatch } = useContext(Context)
  const { userData, isLoggedIn } = state

  const signIn = () => {
    dispatch({ type: "SET_LOGGED_IN", payload: true })
  }

  const signOut = () => {
    dispatch({ type: "SET_LOGGED_IN", payload: false })
  }

  const signInClickHandler = async () => {
    if (isLoggedIn) {
      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log("logged out")
          dispatch({ type: "SET_USER_DATA", payload: { displayName: null } })
          signOut()
        })
        .catch((error) => {
          console.log(error)
        })
    } else {
      const loginResponse = await firebaseLogin()
      if (loginResponse !== 'logged out' && loginResponse.displayName) {
        signIn()
        getUserOrAddToDb(loginResponse)
        dispatch({ type: "SET_USER_DATA", payload: loginResponse })
      }
    }
  }

  const getUserOrAddToDb = (loginResponse: User) => {
    const userId = loginResponse.uid

    const existingUser = database.ref("users/" + userId)

    existingUser.on("value", (snapshot) => {
      const data = snapshot.val() as UserFirebaseData | null

      if (data) {
        dispatch({ type: "SET_USER_DRAFT_DATA", payload: data })
      } else {
        createNewUser(loginResponse, userId)
      }
    })
  }

  const createNewUser = (loginResponse: User, userId: string) => {
    const ref = database.ref("users")

    const data: UserFirebaseData = {
      email: loginResponse.email,
      displayName: loginResponse.displayName,
      drafts: null,
    }

    ref.child(userId).set(data)
    dispatch({ type: "SET_USER_DATA", payload: loginResponse })

    console.log("added user to db")
  }

  return (
    <div>
      <Layout className="layout" style={{ width: "100%" }}>
        <Header style={{ padding: "0px" }}>
          <div className="logo" />
          <span>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
              <Menu.Item key="1" style={{ width: '85px' }}>
                <Link href="/">
                  <span style={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px' }}>
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
                      src={<Image src={isAuthenticatedUser(userData) ? userData.photoURL : undefined} />}
                    />
                  </>
                )}
                <Button
                  onClick={() => { signInClickHandler() }}
                  style={{ marginRight: "15px" }}
                >
                  {isLoggedIn ? "sign out" : "sign in"}
                </Button>
              </span>
            </Menu>
          </span>
        </Header>
        <Content style={{ padding: "10px 20px", minHeight: "85vh" }}>
          <div className="site-layout-content">{children}</div>
        </Content>
        <Footer style={{ textAlign: "center" }}>GolfDraft ©2021</Footer>
      </Layout>
    </div>
  )
}

export default LayoutWrapper
