import THREAD_MODEL from '../../models/thread'

export default async (req, res) => {
  try {
    const posts = await THREAD_MODEL.GET_POSTS(req.query)
    if(posts.length === 0) {
      res.status(404).send({
        "message": "Can't find user with id #42\n"
      })
    } else {
      res.status(200).send(posts)
    }
  } catch ( e ) {
    res.send(500)
  }
}