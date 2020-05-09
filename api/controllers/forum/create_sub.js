import THREAD_MODEL from '../../models/thread'

export default async (req, res) => {
  
  if ( THREAD_MODEL.valid(req.body) ) {
    try {
      const thread = await THREAD_MODEL.CREATE(req.body, req.params.slug)
      if ( !thread ) {
        res.status(404).send({
          message : 'User or forum was not found'
        })
        return
      }
      res.status(201).send(thread)
    } catch ( e ) {
      try {
        const thread = await THREAD_MODEL.GET_FAST(req.body.slug)
        res.status(409).send(thread)
      } catch ( e ) {
        res.status(500).send()
      }
    }
    
  } else {
    res.status(400).send({
      message : `
      Ветка обсуждения имеет поля
      title: string
      author: string
      message: string
      created string or {}
      `
    })
  }
  
}