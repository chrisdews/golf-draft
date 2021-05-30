export default function draftTestHandler(req, res) {
  const { draftid } = req.query;
  res.end(`draft id: ${draftid}`);
}
