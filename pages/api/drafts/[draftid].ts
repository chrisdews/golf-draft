import type { NextApiRequest, NextApiResponse } from "next"

export default function draftTestHandler(req: NextApiRequest, res: NextApiResponse<string>) {
  const { draftid } = req.query
  const id = Array.isArray(draftid) ? draftid[0] : draftid
  res.end(`draft id: ${id}`)
}
