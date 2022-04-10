import React, { useState, useEffect, useRef, useContext } from "react";
import { Form, Input, Modal, Button, Avatar, Typography } from "antd";
import { SmileOutlined, UserOutlined } from "@ant-design/icons";
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

// reset form fields when modal is form, closed
const useResetFormOnCloseModal = ({ form, visible }) => {
  const prevVisibleRef = useRef();
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);
  const prevVisible = prevVisibleRef.current;
  useEffect(() => {
    if (!visible && prevVisible) {
      form.resetFields();
    }
  }, [visible]);
};

const ModalForm = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  useResetFormOnCloseModal({
    form,
    visible,
  });

  const onOk = () => {
    form.submit();
  };

  return (
    <Modal
      title="Invite your friends"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical" name="userForm">
        <Form.Item
          name="name"
          label="User name"
          rules={[
            {
              required: false,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="User Email"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const CreateForm = () => {
  const [visible, setVisible] = useState(false);
  const { state } = useContext(Context);
  const router = useRouter();

  const userId = state?.userData?.uid;
  const displayName = state?.userData?.displayName;

  const createDraftGame = (values, userId) => {
    const draftsRef = database.ref("drafts/");
    const { draftName } = values;

    const draft = draftsRef.push({
      draftName: draftName,
      currentPick: 0,
      users: "",
    });

    const newDraftId = draft.key;
    const newDraft = database.ref("drafts/" + newDraftId + "/users");
    newDraft.child(userId).set({ role: "admin", displayName: displayName });

    const existingUser = database.ref("users/" + userId);
    existingUser
      .child("drafts")
      .child(newDraftId)
      .set({ draftName: draftName });
    router.push({
      pathname: `/draft/${newDraftId}`,
    });
  };

  const showUserModal = () => {
    setVisible(true);
  };

  const hideUserModal = () => {
    setVisible(false);
  };

  const onFinish = (values) => {
    createDraftGame(values, userId);
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
          setVisible(false);
        }
      }}
    >
      <Form {...layout} name="basicForm" onFinish={onFinish}>
        <Form.Item
          name="draftName"
          label="Draft Name"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="User List"
          shouldUpdate={(prevValues, curValues) =>
            prevValues.users !== curValues.users
          }
        >
          {({ getFieldValue }) => {
            const users = getFieldValue("users") || [];
            return users.length ? (
              <ul>
                {users.map((user, index) => (
                  <li key={index} className="user">
                    <Avatar icon={<UserOutlined />} />
                    {user.name} - {user.email}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography.Text className="ant-form-text" type="secondary">
                ( <SmileOutlined /> No user yet. )
              </Typography.Text>
            );
          }}
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button htmlType="submit" type="primary">
            Submit
          </Button>
          <Button
            htmlType="button"
            style={{
              margin: "0 8px",
            }}
            onClick={showUserModal}
          >
            Add User
          </Button>
        </Form.Item>
      </Form>

      <ModalForm visible={visible} onCancel={hideUserModal} />
    </Form.Provider>
  );
};

export default CreateForm;
