import FORUM_MODEL from '../../models/forum'

export default async (req, res) => {
  /*
  OPTIONS
  FORUM CREATED -> 201 RETURN FORUM
  USER DOES NOT EXIST -> 404 ERROR
  FORUM EXISTS -> 409 EXISTING FORUM
   */
  if ( FORUM_MODEL.valid(req.body) ) {
    try {
      const forum = await FORUM_MODEL.CREATE(req.body)
      
      if(!forum) {
        res.status(404).send({ message : 'User not found' })
      } else {
        res.status(201).send(forum)
      }
    } catch ( e ) {
      try {
        const forum = await FORUM_MODEL.GET_EXISTING(req.body.slug)
        res.status(409).send(forum)
      } catch ( e ) {
        //forum does not exists, user exists, not created (something wrong)
        res.status(500).send({ message: 'Unable to create forum' })
      }
    }
  } else {
    res.status(400).send({
      message:
    'Форум имеет поля ' +
    'title: string ' +
    'user: string ' +
    'slug: string'
    })
  }
}