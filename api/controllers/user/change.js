import USER_MODEL from '../../models/user'

export default async (req, res) => {
  /*
  UPDATE USER
  OPTIONS:
  CHANGED -> 200 RETURN USER
  EMAIL EXISTST -> 409 RETURN ERROR
  NICKNAME EXISTS -> 409 RETURN ERROR
  NO USER -> 404 NOT FOUND
  BAD INPUT -> 400
  OTHER -> 400
 */
  if(USER_MODEL.validAny(req.body)) {
    try {
      const user = await USER_MODEL.UPDATE(req.body, req.params.nickname)
      if(!user) {
        res.status(404).send({ message: 'User does not exists' })
        return
      }
      res.status(200).send(user);
    } catch (e) {
      console.log(e)
      res.status(409).send({ message: 'Email already exists' })
    }
    
  } else {
    res.status(400).send({
      message:
    'Пользователь имеет поля ' +
    'fullname: string ' +
    'about: string ' +
    'email: string'
    })
  }
}