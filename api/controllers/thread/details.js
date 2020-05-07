import THREAD_MODEL from '../../models/thread'

export default async (req, res) => {
  try {
    const thread = await THREAD_MODEL.GET(req.params.slug)
    res.status(200).send(thread)
  } catch (e) {
    res.status(404).send({
      "message": "Can't find user with id #42\n"
    })
  }
}