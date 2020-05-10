import USER_MODEL from '../../models/user'

export default async (req, res) => {
  /*
  CREATE USER
  OPTIONS:
  CREATED -> 201 RETURN USER
  EMAIL EXISTST -> 409 RETURN EXISTING USER
  NICKNAME EXISTS -> 409 RETURN EXISTSING USER
  OTHER -> 400
   */
  if(USER_MODEL.valid(req.body)) {
    try {
      //error if email or nickname exists (or incorrect input)
      const user = await USER_MODEL.CREATE(req.body, req.params.nickname)
      res.status(201).send(user)
      return;
    } catch (e) {
      try {
        const existingUser =
          await USER_MODEL.GET_EXISTING(req.body, req.params.nickname)
        res.status(409).send(existingUser)
      } catch ( e ) {
        res.status(400).send({
          message: 'Incorrect input provided'
        })
      }
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