import SERVICE_MODEL from '../../models/service'

export default async (req, res) => {
  try {
    const state = await SERVICE_MODEL.GET();
    res.status(200).send(state)
  } catch (e) {
    res.status(500).send({
      message: 'Не удалось получить данные о базе данных'
    })
  }
}