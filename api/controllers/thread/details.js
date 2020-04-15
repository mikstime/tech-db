import THREAD_MODEL from '../../models/thread'

export default async (req, res) => {
  try {
    const thread = await THREAD_MODEL.GET(req.arguments.slug)
    req.status(200).send(thread)
  } catch (e) {
    req.status(404).send({
      "message": "Can't find user with id #42\n"
    })
  }
}