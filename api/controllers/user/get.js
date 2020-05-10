import USER_MODEL from '../../models/user'

export default async (req, res) => {
  /*
  GET USER
  OPTIONS:
  SUCCESS -> 200 RETURN USER
  NOT FOUND -> 404 ERROR
 */
  try {
    const user = await USER_MODEL.GET(req.params.nickname)
    if(!user) {
      res.status(404).send({message: 'User was not found'})
      return;
    }
    res.status(200).send(user)
  } catch (e) {
    res.status(500).send(
      {
        message: 'Unable to get user'
      }
    )
  }
}