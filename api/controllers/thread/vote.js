import USER_MODEL from '../../models/user'
import THREAD_MODEL from '../../models/thread'
import VOTE_MODEL from '../../models/vote'
export default async (req, res) => {
  if(VOTE_MODEL.valid(req.body)) {
    try {
      const thread = await THREAD_MODEL.CREATE_VOTE(req.body, req.params.slug)
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