import USER_MODEL from '../../models/user'

export default async (req, res) => {
  
  if(USER_MODEL.validAny(req.body)) {
    try {
      const user = await USER_MODEL.UPDATE(req.body, req.params.nickname);
      if(!user) {
        res.status(404).send({
          message: "Can't find user with id #42\n"
        })
        return
      }
      res.status(200).send(user);
    } catch (e) {
      res.status(409).send({
        message: 'email already exists'
      });
    }
    
  } else {
    res.status(400).send({
      message: `
    Пользователь имеет поля
    fullname: string
    about: string
    email: string
    `
    })
  }
}