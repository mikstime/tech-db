import FORUM_MODEL from '../../models/forum'
export default async (req, res) => {
  try {
    const threads = FORUM_MODEL.GET_THREADS(req.arguments.slug)
    res.status(200).send(threads)
  } catch (e) {
    res.status(404).send({
      "message": "Can't find user with id #42\n"
    })
  }
}