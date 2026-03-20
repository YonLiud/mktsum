import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ message: 'get all briefings' })
})

router.post('/', (_req, res) => {
  res.json({ message: 'create briefing' })
})

export default router
