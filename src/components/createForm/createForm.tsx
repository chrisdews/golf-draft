import React, { useState, useEffect, useRef, useContext } from "react"
import { Form, Input, Modal, Button, Select, Alert } from "antd"
import type { FormInstance } from "antd/lib/form"
import { Context } from "../../../context/provider"
import firebaseInit from "../../helpers/firebaseInit"
import { useRouter } from "next/router"
import { Tour, Fixture, isAuthenticatedUser } from "../../types"
import { getTours, getFixtures } from "../../helpers/golfApi"

const { Option } = Select
const database = firebaseInit()

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
}
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
}

interface UseResetFormParams {
  form: FormInstance
  visible: boolean
}

const useResetFormOnCloseModal = ({ form, visible }: UseResetFormParams): void => {
  const prevVisibleRef = useRef<boolean>()
  useEffect(() => {
    prevVisibleRef.current = visible
  }, [visible])
  const prevVisible = prevVisibleRef.current
  useEffect(() => {
    if (!visible && prevVisible) {
      form.resetFields()
    }
  }, [visible])
}

interface ModalFormProps {
  visible: boolean
  onCancel: () => void
}

const ModalForm = ({ visible, onCancel }: ModalFormProps) => {
  const [form] = Form.useForm()
  useResetFormOnCloseModal({ form, visible })

  const onOk = () => {
    form.submit()
  }

  return (
    <Modal
      title="Invite your friends"
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical" name="userForm">
        <Form.Item name="name" label="User name" rules={[{ required: false }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="User Email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}

interface CreateFormValues {
  draftName: string
  tour: string
  tournament: string
}

const CreateForm = () => {
  const [visible, setVisible] = useState<boolean>(false)
  const [toursList, setToursList] = useState<Tour[]>([])
  const [tournamentSelectionId, setTournamentSelectionId] = useState<string | null>(null)
  const [tournamentList, setTournamentList] = useState<Fixture[]>([])
  const { state } = useContext(Context)
  const router = useRouter()

  const userId = isAuthenticatedUser(state.userData) ? state.userData.uid : undefined
  const displayName = state.userData.displayName

  useEffect(() => {
    fetchTours()
  }, [])

  const fetchTours = async () => {
    try {
      const tours = await getTours()
      setToursList(tours.filter((tour) => tour?.active))
    } catch (err) {
      console.error(err)
    }
  }

  const getTournaments = async (tourSelectionString: string) => {
    // tourSelectionString is "{tour_id}/{season_id}" as set by the Select option value
    const [tourId, seasonId] = tourSelectionString.split('/')
    try {
      const fixtures = await getFixtures(tourId, Number(seasonId))
      const filtered = fixtures
        .filter((t) => t?.type === 'Stroke Play')
        .filter((t) => Date.parse(t?.end_date) > Date.now())
      setTournamentList(filtered)
    } catch (err) {
      console.error(err)
    }
  }

  const createDraftGame = (values: CreateFormValues, userId: string) => {
    const draftsRef = database.ref("drafts/")
    const { draftName, tour, tournament } = values

    const draft = draftsRef.push({
      draftName: draftName,
      currentPick: 0,
      draftFinished: false,
      users: "",
      tourRef: tour,
      tournamentId: tournament,
    })

    const newDraftId = draft.key
    const newDraft = database.ref("drafts/" + newDraftId + "/users")
    newDraft.child(userId).set({ role: "admin", displayName: displayName, draftOrderWeight: Math.random() })

    const existingUser = database.ref("users/" + userId)
    existingUser.child("drafts").child(newDraftId!).set({ draftName: draftName })

    router.push({ pathname: `/draft/${newDraftId}` })
  }

  const hideUserModal = () => {
    setVisible(false)
  }

  const onFinish = (values: CreateFormValues) => {
    if (userId) {
      createDraftGame(values, userId)
    }
  }

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
    )
  }

  const onTourChange = (tourSelectionString: string) => {
    setTournamentSelectionId(null)
    setTournamentList([])
    getTournaments(tourSelectionString)
  }

  const onTournamentChange = (value: string) => {
    setTournamentSelectionId(value)
  }

  return (
    <>
      <div style={{ maxWidth: '500px', margin: 'auto' }}>
        <>selected tournament id - {tournamentSelectionId}</>
        <Form.Provider
          onFormFinish={(name, { values, forms }) => {
            if (name === "userForm") {
              const basicForm = forms['basicForm']
              const users = basicForm.getFieldValue("users") || []
              basicForm.setFieldsValue({ users: [...users, values] })
              setVisible(false)
            }
          }}
        >
          <Form {...layout} name="basicForm" onFinish={onFinish}>
            <Form.Item
              style={{ margin: '30px 0' }}
              name="draftName"
              label="Draft Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <div>
              This will be the visible name your draft pals see when they join. It currently can <b>not</b> be changed.
            </div>

            <Form.Item style={{ margin: '30px 0' }} name="tour" label="Tour" rules={[{ required: true }]}>
              <Select placeholder="Select a Tour" onChange={onTourChange} allowClear>
                {toursList.map((tour) => (
                  <Option key={`${tour.tour_id}/${tour.season_id}`} value={`${tour.tour_id}/${tour.season_id}`}>
                    {`${tour.tour_name} - ${tour.season_id}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="tournament" label="Tournament" rules={[{ required: true }]}>
              <Select placeholder="Select a tournament" onChange={onTournamentChange} allowClear>
                {tournamentList?.map((tournament) => (
                  <Option key={`${tournament?.id}`} value={`${tournament?.id}`}>
                    {`${tournament?.name} starts: ${tournament?.start_date}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item {...tailLayout}>
              <Button htmlType="submit" type="primary" style={{ marginTop: "20px" }}>
                Submit
              </Button>
            </Form.Item>
          </Form>

          <ModalForm visible={visible} onCancel={hideUserModal} />
        </Form.Provider>
        {loggedOutNotice()}
      </div>
    </>
  )
}

export default CreateForm
