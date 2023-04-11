import React, { useState, useEffect, useRef, useContext } from "react";
import { Form, Input, Modal, Button } from "antd";
import { Context } from "../../../context/provider";
import firebaseInit from "../../helpers/firebaseInit";

import { useRouter } from "next/router";

const database = firebaseInit();

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const JoinForm = () => {
  const [visible, setVisible] = useState(false);
  const { state } = useContext(Context);
  const router = useRouter();

  const userId = state.userData.uid;
  const displayName = state.userData.displayName;

  const userRef = database.ref("users/" + userId);

  const checkForExistingUser = (users) => {
    if (!userId) {
      console.log("user needs to log in");
    }

    let isExistingUser = false;

    for (const id in users) {
      if (Object.hasOwnProperty.call(users, id)) {
        if (id === userId) {
          console.log("user already exists in draft");
          isExistingUser = true;
        }
      }
    }

    return isExistingUser;
  };

  const addDraftToUser = (draftId, draftName) => {
    userRef.child("drafts").child(draftId).set({ role: "user", draftName: draftName })
  };

  const addUserToDraft = (draftId) => {
    const draftUsers = database.ref("drafts/" + draftId + "/users");

    const newUser = { role: "user", displayName: displayName, draftOrderWeight: Math.random() };
    draftUsers.child(userId).set(newUser);
  };

  const joinDraft = (draftId) => {
    //check draft exists.
    const draftUsers = database.ref("drafts/" + draftId);

    draftUsers.on("value", async (snapshot) => {
      const data = snapshot.val();

      if (data) {
        //check user isn't in the draft already.
        const isExistingUser = checkForExistingUser(data?.users);
        if (isExistingUser) {
          console.log("user already in draft");
        } else {
          // add user to draft

          addUserToDraft(draftId);

          addDraftToUser(draftId, data?.draftName);

          router.push({
            pathname: `/draft/${draftId}`,
          });
        }
      } else {
        console.log("draft doesn't exist");
      }
    });
  };

  const onFinish = (values) => {
    joinDraft(values?.draftId);
  };

  return (
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          if (name === "userForm") {
            const { basicForm } = forms;
            const users = basicForm.getFieldValue("users") || [];
            basicForm.setFieldsValue({
              users: [...users, values],
            });
          }
        }}
      >
        <Form {...layout} name="basicForm" onFinish={onFinish}>
          <Form.Item
            name="draftId"
            label="Draft ID"
            rules={[
              {
                required: true,
              },
            ]}
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
  );
};

export default JoinForm;
