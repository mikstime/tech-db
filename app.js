import express from 'express'
import path from 'path'
import logger from 'morgan'
import USER_ROUTES from './api/routes/user'
import FORUM_ROUTES from './api/routes/forum'
import POST_ROUTES from './api/routes/post'
import SERVICE_ROUTES from './api/routes/service'
import THREAD_ROUTES from './api/routes/thread'
const app = express();
import  './api/models'

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/user/', USER_ROUTES)
app.use('/forum/', FORUM_ROUTES)
app.use('/post/', POST_ROUTES)
app.use('/service/', SERVICE_ROUTES)
app.use('/threads/', THREAD_ROUTES)

app.use((req, res) => {
  res.write('Success')
  res.send()
})
app.listen(8000)
