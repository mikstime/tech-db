import USER_MODEL from '../../models/user'

export default async (req, res) => {
  
  try {
    const user = await USER_MODEL.GET(req.params.nickname);
    res.status(200).send(user);
  } catch (e) {
    res.status(404).send(
      {
        "message": "Can't find user with id #42\n"
      }
    );
  }
}