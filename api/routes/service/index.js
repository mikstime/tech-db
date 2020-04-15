import express from 'express'
const router = express.Router()

import {
  clear,
  status
} from '../../controllers/service'

router.post('/clear', clear)
router.get('/status', status)

export default router