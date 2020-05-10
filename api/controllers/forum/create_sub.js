import THREAD_MODEL from '../../models/thread'

export default async (req, res) => {
  /*
  OPTIONS
  CREATED -> 201 THREAD
  SLUG EXISTS -> 409 EXISTING THREAD
  USER OR FORUM DOES NOT EXISTS -> 404 ERROR
  BAD INPUT -> 400
   */
  if ( THREAD_MODEL.valid(req.body) ) {
    try {
      const thread = await THREAD_MODEL.CREATE(req.body, req.params.slug)
      if ( !thread ) {
        res.status(404).send({ message : 'User or forum was not found' })
        return
      }
      res.status(201).send(thread)
    } catch ( e ) {
      try {
        const thread = await THREAD_MODEL.GET_EXISTING(req.body.slug)
        if(!thread) {
          res.status(404).send({message: 'Forum or User not found'})
          return;
        }
        res.status(409).send(thread)
      } catch ( e ) {
        console.log(e)
        res.status(500).send({message: 'Unable to create thread'})
      }
    }
    
  } else {
    res.status(400).send({
      message :
      'Ветка обсуждения имеет поля' +
      'title: string ' +
      'author: string ' +
      'message: string ' +
      'created string'
    })
  }
  
}