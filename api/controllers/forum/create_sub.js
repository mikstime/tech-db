import FORUM_MODEL from '../../models/forum'
import THREAD_MODEL from '../../models/thread'

export default async (req, res) => {
  
  if ( THREAD_MODEL.valid(req.body)) {
    try {
      try {
        await FORUM_MODEL.GET(req.arguments.slug)
      } catch (e) {
        res.status(404).send({
          "message": "Can't find user with id #42\n"
        })
        return;
      }
      const thread = THREAD_MODEL.CREATE(req.body, req.arguments.slug)
      req.status(201).send(thread)
    } catch (e) {
      const thread = await THREAD_MODEL.GET(req.arguments.slug)
      req.status(409).send(thread)
    }

  } else {
    req.status(400).send({
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