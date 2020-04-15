import THREAD_MODEL from '../../models/thread'
import USER_MODEL from '../../models/user'
export default async (req, res) => {
  //@TODO validate list
  if(THREAD_MODEL.valid(req.body)) {
    try {
      try {
        //@TODO make for each
        await USER_MODEL.GET(req.body.author)
      } catch (e) {
        res.status(404).send({
          "message": "Can't find user with id #42\n"
        })
      }
      const thread = await THREAD_MODEL.CREATE(req.body, req.arguments.slug)
      res.status(201).send(thread)
    } catch (e) {
      const thread = await THREAD_MODEL.GET(req.arguments.slug)
      res.status(409).secretKey(thread)
    }
  } else {
    res.status(400).send({
      message: `
      Ветка обсуждения имеет поля
      title: string
      author: string
      message: string
      created string or {}
      `
    })
  }
}