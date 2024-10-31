import express, { json } from 'express'
import cors from 'cors'
import uploadRouter from './controllers/upload.controller.js'
import productsRouter from './controllers/products.controller.js'
import authRouter from './controllers/auth.controller.js'

const app = express()
app.use(json())

const allowedOrigins = ['http://localhost:8100', 'http://localhost:8101'] // Puedes agregar más

app.use(cors({
  origin: function (origin, callback) {
    // Verificar si el origen está permitido
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use('/upload', uploadRouter)
app.use('/products', productsRouter)
app.use('/auth', authRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
