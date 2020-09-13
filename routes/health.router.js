import express from 'express'

const healthRouter = express.Router()

healthRouter.get('/', (req, res) => {
  res.status(200).send({ message: 'OK' })
})

export default healthRouter
