import express from 'express'
const router = express.Router()

import {
  details,
  change,
} from '../../controllers/post'

router.get('/:id/details', details)
router.post('/:id/details', change)

export default router