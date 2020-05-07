import THREAD_MODEL from '../../models/thread'
import USER_MODEL from '../../models/user'
import POST_MODEL from '../../models/post'
export default async (req, res) => {
  //@TODO validate list
  if(POST_MODEL.validList(req.body)) {
    try {
      try {
        
        const user = await USER_MODEL.GET(req.body.author)
        const thread = await THREAD_MODEL.GET(req.params.slug)
        const posts = await POST_MODEL.CREATE(req.body, thread)
        res.status(201).send(posts)
      } catch (e) {
        console.log(e)
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