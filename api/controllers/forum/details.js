import FORUM_MODEL from '../../models/forum'

export default async (req, res) => {
  
  try {
    const forum = await FORUM_MODEL.GET(req.params.slug)
    res.status(200).send(forum)
    
  } catch (e) {
    res.status(404).send({
      "message": "Can't find user with id #42\n"
    })
  }
  
}