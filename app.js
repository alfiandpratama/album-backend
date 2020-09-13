import express from 'express'
import mongoose from 'mongoose'
import logger from 'morgan'
import config from 'config'
import cors from 'cors'

// Import Router
import healthRouter from './routes/health.router.js'
import photosRouter from './routes/photos.router.js'

const app = express()

// Middlewares
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true
  })
)
app.use(cors())
app.use(logger('dev'))

// DB Connection
mongoose
  .connect(`${config.get('dbUrl')}/${config.get('dbName')}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connected'))

mongoose.connection.on('error', (err) => {
  console.log(`DB connection error: ${err.message}`)
})

// Route
app.use('/health', healthRouter)
app.use('/photos', photosRouter)

// Port
const port = process.env.PORT || 8888

const server = app.listen(port)

// Export Express App & Server Connection
export default server
export { app }
