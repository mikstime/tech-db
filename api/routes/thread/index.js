import express from 'express'
const router = express.Router()

import {
  create,
  details,
  change,
  posts,
  vote,
} from '../../controllers/thread'

router.post('/:slug/create/', create)
router.get('/:slug/details', details)
router.post('/:slug/details', change)
router.get('/:slug/posts', posts)
router.post('/:slug/vote', vote)

export default router