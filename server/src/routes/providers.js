import { Router } from 'express'
import Provider from '../models/Provider.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query
    const q = category ? { category } : {}
    const providers = await Provider.find(q).sort({ name: 1 })
    res.json({ providers })
  } catch (err) { next(err) }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ slug: req.params.slug })
    if (!provider) return res.status(404).json({ error: 'not_found' })
    res.json({ provider })
  } catch (err) { next(err) }
})

export default router
