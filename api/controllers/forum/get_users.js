import FORUM_MODEL from '../../models/forum'
export default async (req, res) => {
  try {
    const forum = await FORUM_MODEL.GET(req.params.slug)
    if(!forum) {
      res.status(404).send({
        "message": "Can't find user with id #42\n"
      })
      return;
    }
    const users = await FORUM_MODEL.GET_USERS(req.params.slug, req.query)
    res.status(200).send(users)
  } catch (e) {
    res.status(404).send({
      "message": "Can't find user with id #42\n"
    })
  }
}