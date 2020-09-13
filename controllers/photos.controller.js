import Photo from '../models/photos.model.js'
import config from 'config'
import fsWithCallbacks from 'fs'
import Joi from 'joi'

const url = config.get('host')
const fs = fsWithCallbacks.promises

const uploadPhotos = async (req, res, next) => {
  const schema = Joi.object({
    album: Joi.string().required()
  })

  const { error } = schema.validate(req.body)

  if (error) return res.status(400).send('Invalid input.')

  const { album } = req.body

  const data = await req.files.map(async (file) => {
    const originalname = file.originalname
    const duplicateCount = await Photo.getDuplicateCount(album, originalname)

    const name = await Photo.createFileName(originalname, duplicateCount)
    const path = `/albums/${album.toLowerCase()}/${name}`

    await fs.mkdir(`./albums/${album.toLowerCase()}`, { recursive: true })
    await fs.writeFile(`.${path}`, file.buffer, 'binary')

    const photo = new Photo({
      album,
      name,
      path
    })

    const result = await photo.insert()

    return { ...result, raw: photo.getUrl(url) }
  })

  Promise.all(data).then((results) => {
    res.send({
      message: 'OK',
      data: results
    })
  })
}

const listPhotos = async (req, res) => {
  const { skip, limit } = req.body
  const schema = Joi.object({
    skip: Joi.number().required(),
    limit: Joi.number().required()
  })

  const { error } = schema.validate(req.body)

  if (error) return res.status(400).send('Invalid input.')

  const count = await Photo.getCount()

  let photos = await Photo.getPaginated(skip, limit)

  photos = await photos.map((photo) => {
    return {
      id: photo.id,
      album: photo.album,
      name: photo.name,
      path: photo.path,
      raw: `${photo.getUrl(url)}`
    }
  })

  res.send({
    message: 'OK',
    documents: photos,
    count: count,
    skip: skip,
    limit: limit
  })
}

const deletePhoto = async (req, res) => {
  const { album, fileName } = req.params
  const schema = Joi.object({
    album: Joi.string().required(),
    fileName: Joi.string().required()
  })

  const { error } = schema.validate(req.params)

  if (error) return res.status(400).send('Invalid paramaters.')

  const photo = await Photo.deleteByName(album, fileName)

  if (photo) {
    fs.unlink(`.${photo.path}`)

    return res.send({
      message: 'OK'
    })
  } else {
    return res.status(404).send({
      message: 'Not Found'
    })
  }
}

const deletePhotos = async (req, res) => {
  const albums = req.body
  const schema = Joi.array().items(Joi.object({
    album: Joi.string().required(),
    documents: Joi.string().required()
  }))

  const { error } = schema.validate(albums)
  if (error) return res.status(400).send('Invalid input.')

  const photoPromises = []
  const failedList = []

  for (const album of albums) {
    const albumName = album.album
    const files = album.documents.split(',').map((item) => item.trim())

    for (const file of files) {
      const photo = await Photo.deleteByName(albumName, file)

      if (photo) {
        await fs.unlink(`.${photo.path}`)
      } else {
        failedList.push(file)
      }

      photoPromises.push(photo)
    }
  }

  Promise.all(photoPromises)
    .then((results) => {
      if (results.includes(null, 0)) {
        res.status(404).send({
          message: 'FAILED', failed: failedList
        })
      } else {
        res.send({
          message: 'OK'
        })
      }
    })
}

export { uploadPhotos, listPhotos, deletePhoto, deletePhotos }
