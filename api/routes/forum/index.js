import express from 'express'
const router = express.Router()

import {
  getUsers,
  getThreads,
  createSub,
  create,
  details,
} from '../../controllers/forum'

router.post('/create', create)
router.get('/:slug/details', details)
router.post('/:slug/create', createSub)
router.get('/:slug/users', getUsers)
router.get('/:slug/threads', getThreads)

export default router