import USER_MODEL from '../../models/user'
import THREAD_MODEL from '../../models/thread'
import VOTE_MODEL from '../../models/vote'
export default async (req, res) => {
  if(VOTE_MODEL.valid(req.body)) {
    try {
      try {
        await USER_MODEL.GET(req.body.nickname)
      } catch (e) {
        res.status(404).send({
          "message": "Can't find user with id #42\n"
        })
      }
      const thread = await THREAD_MODEL.CREATE_VOTE(req.body, req.arguments.slug)
      res.status(200).send(thread)
    } catch (e) {
      res.status(500).send({
        message: 'Не удалось проголосовать'
      })
    }
  } else {
    res.status(400).send({
      message: `
    Голос имеет поля
    nickname: string
    voice number
    `
    })
  }
}