import express from 'express'
const router = express.Router()

import {
  getProfile,
  changeProfile,
  createProfile
} from '../../controllers/user'

router.get('/:nickname/profile', getProfile)
router.post('/:nickname/profile', changeProfile)
router.post('/:nickname/create', createProfile)

export default router