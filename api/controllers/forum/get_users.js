import FORUM_MODEL from '../../models/forum'
export default async (req, res) => {
  try {
    const users = FORUM_MODEL.GET_USERS(req.arguments.slug)
    res.status(200).send(users)
  } catch (e) {
    res.status(404).send({
      "message": "Can't find user with id #42\n"
    })
  }
}