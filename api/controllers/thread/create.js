import THREAD_MODEL from '../../models/thread'
import USER_MODEL from '../../models/user'
import POST_MODEL from '../../models/post'
export default async (req, res) => {
  //@TODO validate list
  if(POST_MODEL.validList(req.body)) {
    try {
      try {
        const posts = await POST_MODEL.CREATE(req.body, req.params.slug)
        if(!posts) {
          res.status(404).send({
            "message": "Can't find user with id #42\n"
          })
          return;
        }
        res.status(201).send(posts)
      } catch (e) {
        res.status(404).send({
          "message": "Can't find user with id #42\n"
        })
      }
    } catch (e) {
      res.status(409).send({
        "message": "Can't find user with id #42\n"
      })
    }
  } else {
    res.status(400).send({
      message: `
      Пост имеет поля
      author: string
      message: string
      parent: int
      `
    })
  }
}