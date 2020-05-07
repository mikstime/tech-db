import USER_MODEL from '../../models/user'

export default async (req, res) => {
  
  if(USER_MODEL.valid(req.body)) {
    try {
      const user = await USER_MODEL.CREATE(req.body, req.params.nickname);
      res.status(201).send(user);
      return;
    } catch (e) {
      console.log(e)
      try {
        const user = await USER_MODEL.GET(req.params.nickname);
        res.status(409).send(user);
      } catch (e) {
        res.status(409).send({
          message: 'email already exists'
        });
      }
      
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