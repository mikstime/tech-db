import FORUM_MODEL from '../../models/forum'

export default async (req, res) => {
  /*
  OPTIONS
  EXISTS -> 200 FORUM
  NOT FOUND -> 404 ERROR
   */
  try {
    const forum = await FORUM_MODEL.GET(req.params.slug)
    if(!forum) {
      res.status(404).send({ message: 'Forum not found' })
      return;
    }
    res.status(200).send(forum)
  } catch (e) {
    // something wrong
    console.log(e)
    res.status(500).send({ message: 'Unable to get forum details' })
  }
  
}