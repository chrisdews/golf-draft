import React, { useState, useEffect, useRef, useContext } from "react";
import { Form, Input, Modal, Button, Select, Avatar, Typography, Alert } from "antd";
import { Context } from "../../../context/provider";
import firebaseInit from "../../helpers/firebaseInit";

import { useRouter } from "next/router";

const { Option } = Select;
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
  const [toursList, setToursList] = useState([])
  const [tournamentSelectionId, setTournamentSelectionId] = useState(null)
  const [tournamentList, setTournamentList] = useState([])
  const { state } = useContext(Context);
  const router = useRouter();

  const userId = state?.userData?.uid;
  const displayName = state?.userData?.displayName;

  useEffect(() => {
    getTours();
  }, []);

  const getTours = async () => {
    console.log("get tours list called =========");
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/tours`,
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
        setToursList(res?.results.filter(tour => tour?.active))
      })
      .catch((err) => {
        // setErrorText(err.toString());
        console.error(err);
      });
  }

  const getTournaments = async (tourSelectionString) => {
    console.log("get tournaments list called =========");
    await fetch(
      `https://golf-leaderboard-data.p.rapidapi.com/fixtures/${tourSelectionString}`,
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
        const filteredResults = res?.results?.filter(tournament => tournament?.type === 'Stroke Play').filter(tournament => Date.parse(tournament?.end_date) > Date.now())
        setTournamentList(filteredResults)
      })
      .catch((err) => {
        // setErrorText(err.toString());
        console.error(err);
      });
  }

  const createDraftGame = (values, userId) => {
    const draftsRef = database.ref("drafts/");
    const { draftName, tour, tournament } = values;

    const draft = draftsRef.push({
      draftName: draftName,
      currentPick: 0,
      draftFinished: false,
      users: "",
      tourRef: tour,
      tournamentId: tournament,
    });

    const newDraftId = draft.key;
    const newDraft = database.ref("drafts/" + newDraftId + "/users");
    newDraft.child(userId).set({ role: "admin", displayName: displayName, draftOrderWeight: Math.random() });

    const existingUser = database.ref("users/" + userId);
    existingUser
      .child("drafts")
      .child(newDraftId)
      .set({ draftName: draftName });
    router.push({
      pathname: `/draft/${newDraftId}`,
    });
  };

  const hideUserModal = () => {
    setVisible(false);
  };

  const onFinish = (values) => {
    createDraftGame(values, userId);
  };

  const loggedOutNotice = () => {
    return (
      !userId && (
        <Alert
          message="Logged Out!"
          description="You must be logged in to participate."
          type="error"
          closable
        />
      )
    );
  };

  const onTourChange = (tourSelectionString) => {
    setTournamentSelectionId(null)
    setTournamentList([])
    getTournaments(tourSelectionString)
  };

  const onTournamentChange = (value) => {
    setTournamentSelectionId(value)
  }

  return (
    <div>
      <>selected tournament id - {tournamentSelectionId}</>
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
          This will be the visible name your draft pals see when they join. It currently can <b>not</b> be changed.

          <Form.Item name="tour" label="Tour" rules={[{ required: true }]}>
            <Select
              placeholder="Select a Tour"
              onChange={onTourChange}
              allowClear
            >
              {toursList.map((tour) => <Option value={`${tour.tour_id}/${tour.season_id}`}>
                {`${tour.tour_name} - ${tour.season_id}`}
              </Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="tournament" label="Tournament" rules={[{ required: true }]}>
            <Select
              placeholder="Select a tournament"
              onChange={onTournamentChange}
              allowClear
            >
   
              {tournamentList?.map((tournament) => <Option value={`${tournament?.id}`}>
                {`${tournament.name} starts: ${tournament.start_date}`}
              </Option>)}
            </Select>
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button htmlType="submit" type="primary" style={{ "margin-top": "20px" }}>
              Submit
            </Button>
          </Form.Item>
        </Form>

        <ModalForm visible={visible} onCancel={hideUserModal} />
      </Form.Provider>

      {loggedOutNotice()}

    </div>
  );
};

export default CreateForm;
