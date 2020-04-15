import SERVICE_MODEL from '../../models/service'

export default async (req, res) => {
  try {
    await SERVICE_MODEL.DELETE();
    res.status(200).send()
  } catch (e) {
    res.status(500).send({
      message: 'Не удалось очистить базу данных'
    })
  }
}