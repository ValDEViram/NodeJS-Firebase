import express, { json } from 'express'
import { userRepository } from './models/users.js'
import cors from 'cors'
const app = express()

app.use(cors())
app.use(json())

app.use(cors({
  origin: 'http://localhost:8100', // Cambia esto a la URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
}))

app.post('/register', async (req, res) => {
  const { email, username, password } = req.body

  // Validar datos antes de seguir
  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ message: 'Todos los campos son obligatorios' })
  }

  // Llamar a la función que guarda el usuario en Firestore
  try {
    await userRepository.createUser({ email, username, password })
    res.status(201).json({ message: 'Usuario creado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creando el usuario', error })
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  // Validar datos antes de seguir
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Todos los campos son obligatorios' })
  }

  // Llamar a la función que guarda el usuario en Firestore
  try {
    await userRepository.loginUser({ email, password })
    res.status(201).json({ email, password })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creando el usuario', error })
  }
})

app.get('/getUsers', async (req, res) => {
  const users = await userRepository.getUsers()
  try {
    res.status(201).send(users)
  } catch (error) {
    res.status(500).json({ message: 'Error al conseguir los usuarios', error })
  }
})

app.post('/addProducts', async (req, res) => {
  const { id, productos } = req.body
  try {
    await userRepository.addProducts({ id, productos })
    res.status(201).send(`Se agregaron correctamente los productos: ${productos} al usuario: ${id}`)
  } catch (error) {
    res.status(500).json({ 'Error al actualizar el usuario': error })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
