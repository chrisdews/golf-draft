import React, { useContext } from "react"
import { Form, Input, Button } from "antd"
import { Context } from "../../../context/provider"
import firebaseInit from "../../helpers/firebaseInit"
import { useRouter } from "next/router"
import { isAuthenticatedUser } from "../../types"

const database = firebaseInit()

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
}
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
}

interface JoinFormValues {
  draftId: string
}

const JoinForm = () => {
  const { state } = useContext(Context)
  const router = useRouter()

  const userId = isAuthenticatedUser(state.userData) ? state.userData.uid : undefined
  const displayName = state.userData.displayName

  const userRef = userId ? database.ref("users/" + userId) : null

  const checkForExistingUser = (users: Record<string, unknown> | null): boolean => {
    if (!userId) {
      console.log("user needs to log in")
      return false
    }

    let isExistingUser = false

    for (const id in users) {
      if (Object.hasOwnProperty.call(users, id)) {
        if (id === userId) {
          console.log("user already exists in draft")
          isExistingUser = true
        }
      }
    }

    return isExistingUser
  }

  const addDraftToUser = (draftId: string, draftName: string) => {
    userRef?.child("drafts").child(draftId).set({ role: "user", draftName: draftName })
  }

  const addUserToDraft = (draftId: string) => {
    if (!userId) return
    const draftUsers = database.ref("drafts/" + draftId + "/users")
    const newUser = { role: "user", displayName: displayName, draftOrderWeight: Math.random() }
    draftUsers.child(userId).set(newUser)
  }

  const joinDraft = (draftId: string) => {
    const draftUsers = database.ref("drafts/" + draftId)

    draftUsers.on("value", async (snapshot) => {
      const data = snapshot.val() as { users: Record<string, unknown>; draftName: string } | null

      if (data) {
        const isExistingUser = checkForExistingUser(data?.users)
        if (isExistingUser) {
          console.log("user already in draft")
        } else {
          addUserToDraft(draftId)
          addDraftToUser(draftId, data?.draftName)
          router.push({ pathname: `/draft/${draftId}` })
        }
      } else {
        console.log("draft doesn't exist")
      }
    })
  }

  const onFinish = (values: JoinFormValues) => {
    joinDraft(values?.draftId)
  }

  return (
    <Form.Provider
      onFormFinish={(name, { values, forms }) => {
        if (name === "userForm") {
          const basicForm = forms['basicForm']
          const users = basicForm.getFieldValue("users") || []
          basicForm.setFieldsValue({ users: [...users, values] })
        }
      }}
    >
      <Form {...layout} name="basicForm" onFinish={onFinish}>
        <Form.Item
          name="draftId"
          label="Draft ID"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button htmlType="submit" type="primary">
            JOIN DRAFT
          </Button>
        </Form.Item>
      </Form>
    </Form.Provider>
  )
}

export default JoinForm
