import express from 'express'
import multer from 'multer'
import {
  uploadPhotos,
  listPhotos,
  deletePhoto,
  deletePhotos
} from '../controllers/photos.controller.js'

const photosRouter = express.Router()
const upload = multer()

photosRouter.use('/', express.static('albums'))

photosRouter.put('/', upload.array('documents'), uploadPhotos)
photosRouter.post('/list', listPhotos)
photosRouter.delete('/:album/:fileName', deletePhoto)
photosRouter.delete('/', deletePhotos)

export default photosRouter
