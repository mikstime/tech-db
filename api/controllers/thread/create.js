import POST_MODEL from '../../models/post'

export default async (req, res) => {
  /*
  OPTIONS
  POST CREATED -> 201 RETURN POST
  FORUM NOT FOUND -> 404 RETURN ERROR
  USER NOT FOUND -> 404 RETURN ERROR
  THREAD NOT FOUND -> 404 RETURN ERROR
  PARENT NOT FOUND -> 404 RETURN ERROR
  PARENT IN ANOTHER THREAD -> 409 RETURN ERROR
   */
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
        if(e.message === 'invalid parent') {
          res.status(409).send({
            "message": "Can't find user with id #42\n"
          })
          return;
        }
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