import FORUM_MODEL from '../../models/forum'
import USER_MODEL from '../../models/user'

export default async (req, res) => {
  
  if ( FORUM_MODEL.valid(req.body) ) {
    try {
      try {
        await USER_MODEL.GET(req.body.user)
      } catch ( e ) {
        res.status(404).send({
          'message' : 'Can\'t find user with id #42'
        })
        return
      }
      const forum = await FORUM_MODEL.CREATE(req.body)
      res.status(201).send(forum)
      
    } catch ( e ) {
      try {
        const forum = await FORUM_MODEL.GET(req.params.slug)
        res.status(409).send(forum)
      } catch ( e ) {
        res.status(500).send()
      }
      
    }
    
  } else {
    res.status(400).send(`
    Форум имеет поля
    title: string
    user: string
    slug: string
    `)
  }
}