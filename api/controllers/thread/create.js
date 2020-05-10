import POST_MODEL from '../../models/post'

export default async (req, res) => {
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
        if(e.message === 'Parent post was created in another thread')
          throw e
        res.status(404).send({
          "message": "Can't find user with id #42\n"
        })
      }
    } catch (e) {
      console.log('error at final', e)
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