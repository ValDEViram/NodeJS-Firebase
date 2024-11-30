import express, { json } from 'express'
import cors from 'cors'
import uploadRouter from './controllers/upload.controller.js'
import productsRouter from './controllers/products.controller.js'
import authRouter from './controllers/auth.controller.js'
import cookieParser from 'cookie-parser'

const app = express()
app.use(cookieParser())
app.use(json())

const allowedOrigins = ['http://localhost:8100', 'http://localhost:8101', 'http://localhost:5173']

app.use(cors({
  origin: function (origin, callback) {
    // Verificar si el origen está permitido
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.use('/api/upload', uploadRouter)
app.use('/api/products', productsRouter)
app.use('/api/auth', authRouter)

// Aquí no se usa `app.listen` porque Vercel maneja las funciones serverless automáticamente
export default app
