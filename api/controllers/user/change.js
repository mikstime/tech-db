import USER_MODEL from '../../models/user'
//@TODO 409 response code ???
export default async (req, res) => {
  
  if(USER_MODEL.validAny(req.body)) {
    try {
      const user = await USER_MODEL.UPDATE(req.body, req.params.nickname);
      res.status(200).send(user);
      return;
    } catch (e) {
      res.status(404).send({
        message: "Can't find user with id #42\n"
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