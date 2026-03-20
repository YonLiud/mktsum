import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ message: 'get all users' })
})

router.post('/', (_req, res) => {
  res.json({ message: 'create user' })
})

export default router
