import mongoose from 'mongoose'
const { Schema } = mongoose

const photoSchema = new Schema({
  album: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  path: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  }
})

class PhotoClass {
  async insert () {
    await this.save()
    return {
      album: this.album,
      name: this.name,
      path: this.path
    }
  }

  static deleteByName (album, name) {
    return this.findOneAndDelete({
      album,
      name
    })
  }

  getUrl (hostname) {
    return `${hostname}/photos/${this.album.toLowerCase()}/${this.name}`
  }

  static getCount () {
    return Photo.find().countDocuments()
  }

  static getPaginated (skip, limit) {
    return this.find().skip(skip).limit(limit).select({ album: 1, name: 1, path: 1 })
  }

  static getDuplicateCount (album, name) {
    const parts = name.split('.')
    const pattern = '^' + parts[0] + '\\(\\d+\\).' + parts[1]
    return this.find()
      .or([{ name: new RegExp(pattern), album: album }, { name: name, album }])
      .countDocuments()
  }

  static createFileName (originalname, duplicateCount) {
    const namePart = originalname.split('.')
    if (duplicateCount > 0) {
      return `${namePart[0]}(${duplicateCount}).${namePart[1]}`
    } else {
      return originalname
    }
  }
}

photoSchema.loadClass(PhotoClass)

const Photo = mongoose.model('photos', photoSchema)

export default Photo
