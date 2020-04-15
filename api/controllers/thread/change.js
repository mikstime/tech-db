import THREAD_MODEL from '../../models/thread'

export default async (req, res) => {
  if(THREAD_MODEL.validAny(req.body)) {
    try {
      const thread = await THREAD_MODEL.CREATE(req.body, req.arguments.slug)
      req.status(200).send(thread)
    } catch (e) {
      req.status(404).send({
        "message": "Can't find user with id #42\n"
      })
    }
  } else {
    req.status(400).send({
      message: `
      Ветка обсуждения имеет поля
      title: string
      message: string
      `
    })
  }
}