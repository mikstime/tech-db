import POST_MODEL from '../../models/post'

export default async (req, res) => {
  if(POST_MODEL.validAny(req.body)) {
    try {
      const post = await POST_MODEL.UPDATE(req.body, req.params.id)
      res.status(200).send(post)
    } catch (e) {
      res.status(404).send({
        "message": "Can't find user with id #42\n"
      })
    }
  } else {
    res.status(400).send(`
    Пост имеет поля
    message: string
    `)
  }
}