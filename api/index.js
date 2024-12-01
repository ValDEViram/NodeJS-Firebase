import express, { json } from 'express'
import cors from 'cors'
import productsRouter from '../controllers/products.controller.js'
import authRouter from '../controllers/auth.controller.js'
import cookieParser from 'cookie-parser'

const app = express()

// Middleware
app.use(cookieParser())
app.use(json())

// CORS configuration
const allowedOrigins = ['http://localhost:8100', 'http://localhost:8101', 'http://localhost:5173', 'https://red-tree-03949700f.4.azurestaticapps.net/']

app.use(
  cors({
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
  })
)

// Rutas
app.get('/', (req, res) => {
  res.status(200).send('Hello, world!')
})

app.use('/api/products', productsRouter)
app.use('/api/auth', authRouter)

// Exportar la app para Vercel
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
