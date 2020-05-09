import FORUM_MODEL from '../../models/forum'

export default async (req, res) => {
  
  if ( FORUM_MODEL.valid(req.body) ) {
    try {
      const forum = await FORUM_MODEL.CREATE(req.body)
      if(!forum)
        res.status(404).send({
          message: "Not Found"
        })
      else
        res.status(201).send(forum)
    } catch ( e ) {
      try {
        const forum = await FORUM_MODEL.GET(req.body.slug)
        res.status(409).send(forum)
      } catch ( e ) {
        res.status(500).send()
      }
      
    }
    
  } else {
    res.status(400).send({
      message: `
    Форум имеет поля
    title: string
    user: string
    slug: string
    `
    })
  }
}