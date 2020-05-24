import 'babel-polyfill'
import dotenv from 'dotenv'
dotenv.config()
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

app.use(logger('tiny', {
  skip: function (req, res) {
    return new Date(res._startTime) - new Date(req._startTime) < 100 || req.method !== 'GET' }
}))
// app.use(logger('dev'))
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use('/api/user/', USER_ROUTES)
app.use('/api/forum/', FORUM_ROUTES)
app.use('/api/post/', POST_ROUTES)
app.use('/api/service/', SERVICE_ROUTES)
app.use('/api/thread/', THREAD_ROUTES)

app.use((req, res) => {
  res.write('Success')
  res.send()
})
app.listen(process.env.HTTP_PORT)
