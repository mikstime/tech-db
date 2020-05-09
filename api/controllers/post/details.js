import POST_MODEL from '../../models/post'

export default async (req, res) => {
  try {
    const post = await POST_MODEL.GET(req.params.id, req.query)
    res.status(200).send(post)
  } catch (e) {
    res.status(404).send({
      "message": "Can't find user with id #42\n"
    })
  }
}